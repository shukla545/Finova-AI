import axios from 'axios';

const NEWS_BASE_URL = 'https://newsapi.org/v2/everything';

// ─── Trusted financial news sources (NewsAPI source IDs) ─────────────────────
const FINANCIAL_DOMAINS = [
  'reuters.com', 'bloomberg.com', 'ft.com', 'wsj.com', 'cnbc.com',
  'forbes.com', 'businessinsider.com', 'marketwatch.com', 'investing.com',
  'economictimes.indiatimes.com', 'livemint.com', 'moneycontrol.com',
  'financialexpress.com', 'businesstoday.in', 'thehindu.com',
  'morningstar.com', 'barrons.com', 'seekingalpha.com', 'fool.com',
  'finance.yahoo.com', 'thestreet.com', 'zacks.com',
].join(',');

// ─── Noise keywords — if title/description contains these AND no finance term, reject ──
const NOISE_PATTERNS = [
  /\bwar\b/i, /\bmilitary\b/i, /\bsoldier/i, /\battack/i, /\bbomb/i,
  /\belection\b/i, /\bpolitics\b/i, /\bpolitical\b/i, /\bcelebrit/i,
  /\bsports\b/i, /\bfootball\b/i, /\bcricket\b(?!.*stock)/i,
  /\bweather\b/i, /\bearthquake\b/i, /\bfloods?\b/i,
  /\bfilm\b/i, /\bmovie\b/i, /\bactor\b/i, /\bmusic\b/i,
];

// ─── Finance anchor terms — article must contain at least one ────────────────
const FINANCE_ANCHORS = [
  /\bstock\b/i, /\bshare[sd]?\b/i, /\bearning[sd]?\b/i, /\brevenue\b/i,
  /\bprofit\b/i, /\bloss\b/i, /\bmarket\b/i, /\binvest/i, /\bipo\b/i,
  /\bquarter(ly)?\b/i, /\bannual\b/i, /\bfinanci/i, /\bvaluat/i,
  /\bdividend/i, /\bforecast\b/i, /\boutlook\b/i, /\bgrowth\b/i,
  /\bdebt\b/i, /\bequity\b/i, /\bfund\b/i, /\bcrypto\b/i, /\bbond\b/i,
  /\bcommodit/i, /\bsector\b/i, /\banalyst\b/i, /\brating\b/i,
  /\bupgrade\b/i, /\bdowngrade\b/i, /\btarget price\b/i, /\bbullish\b/i,
  /\bbearish\b/i, /\brally\b/i, /\bcorrection\b/i, /\bsell-?off\b/i,
];

// ─── Entity map: common names → NewsAPI search terms ─────────────────────────
const ENTITY_MAP = {
  reliance: 'Reliance Industries',
  'reliance industries': 'Reliance Industries',
  tata: 'Tata Group',
  'tata motors': 'Tata Motors',
  infosys: 'Infosys',
  wipro: 'Wipro',
  hdfc: 'HDFC Bank',
  icici: 'ICICI Bank',
  sbi: 'State Bank India',
  bajaj: 'Bajaj Finance',
  adani: 'Adani Group',
  apple: 'Apple Inc',
  tesla: 'Tesla',
  microsoft: 'Microsoft',
  google: 'Alphabet Google',
  amazon: 'Amazon',
  nvidia: 'Nvidia',
  meta: 'Meta Platforms',
  netflix: 'Netflix',
  nifty: 'Nifty 50 index',
  sensex: 'Sensex BSE',
  nasdaq: 'Nasdaq',
  bitcoin: 'Bitcoin crypto',
  ethereum: 'Ethereum crypto',
};

// ─── Finance query expander ───────────────────────────────────────────────────
/**
 * Builds a rich NewsAPI query string from a user's natural language query.
 * Strategy: extract entity + expand with financial synonyms using OR operators.
 */
export function buildFinancialQuery(query) {
  const lower = query.toLowerCase();

  // 1. Try to match a known entity
  let entityTerm = null;
  for (const [key, val] of Object.entries(ENTITY_MAP)) {
    if (lower.includes(key)) {
      entityTerm = val;
      break;
    }
  }

  // 2. If no known entity, extract meaningful tokens
  if (!entityTerm) {
    const stopwords = new Set([
      'is', 'are', 'the', 'a', 'an', 'good', 'bad', 'worth', 'buying',
      'selling', 'should', 'i', 'we', 'my', 'will', 'can', 'do', 'does',
      'what', 'how', 'why', 'when', 'tell', 'me', 'about', 'give', 'find',
      'invest', 'investment', 'stock', 'share', 'market', 'best', 'top',
    ]);
    const tokens = lower
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => !stopwords.has(w) && w.length > 2);
    entityTerm = tokens.slice(0, 2).join(' ') || query.slice(0, 30);
  }

  // 3. Detect query intent to add appropriate financial modifiers
  const intents = [];
  if (/earn|result|quarter|annual|revenue|profit|loss/.test(lower)) {
    intents.push('earnings', 'financial results');
  }
  if (/invest|buy|hold|sell|portfolio/.test(lower)) {
    intents.push('stock analysis', 'investment outlook');
  }
  if (/price|target|valuation|pe|ratio/.test(lower)) {
    intents.push('stock price', 'target price', 'valuation');
  }
  if (/news|latest|recent|update/.test(lower)) {
    intents.push('latest news', 'market update');
  }
  if (intents.length === 0) {
    // Default financial modifiers
    intents.push('stock', 'earnings', 'financial performance');
  }

  // 4. Build final query: entity AND (intent1 OR intent2 OR ...)
  const intentStr = intents.map(i => `"${i}"`).join(' OR ');
  return `"${entityTerm}" AND (${intentStr})`;
}

// ─── Article relevance filter ─────────────────────────────────────────────────
/**
 * Score each article for financial relevance (0–10).
 * Returns only articles scoring >= threshold.
 */
function scoreArticleRelevance(article, entityTerm) {
  const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
  const entity = entityTerm.toLowerCase();
  let score = 0;

  // Entity mention in title = strong signal
  if (article.title?.toLowerCase().includes(entity.split(' ')[0])) score += 4;
  // Entity mention in description
  if (text.includes(entity.split(' ')[0])) score += 2;

  // Finance anchor present
  const hasFinanceAnchor = FINANCE_ANCHORS.some(r => r.test(text));
  if (hasFinanceAnchor) score += 3;

  // Noise penalty
  const isNoisy = NOISE_PATTERNS.some(r => {
    if (!r.test(text)) return false;
    // Only penalize if no finance anchor overrides
    return !hasFinanceAnchor;
  });
  if (isNoisy) score -= 5;

  // Trusted source bonus
  const sourceDomain = article.url || '';
  const trustedDomains = [
    'reuters', 'bloomberg', 'cnbc', 'marketwatch', 'moneycontrol',
    'economictimes', 'livemint', 'financialexpress', 'businesstoday',
    'forbes', 'wsj', 'ft.com', 'seeking', 'morningstar', 'barron',
  ];
  if (trustedDomains.some(d => sourceDomain.includes(d))) score += 2;

  // Removed articles
  if (article.title === '[Removed]' || !article.description) score = -99;

  return score;
}

// ─── Main fetch function ──────────────────────────────────────────────────────
/**
 * Fetch and filter high-quality financial news for a query.
 * Returns array of { title, description, source, url, publishedAt, relevanceScore }
 */
export async function fetchFinancialNews(query) {
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  if (!NEWS_API_KEY) throw new Error('NEWS_API_KEY is not configured.');

  const financialQuery = buildFinancialQuery(query);
  console.log(`[dataAgent] Query built: ${financialQuery}`);

  // Extract primary entity for relevance scoring
  const lower = query.toLowerCase();
  let primaryEntity = 'finance';
  for (const key of Object.keys(ENTITY_MAP)) {
    if (lower.includes(key)) { primaryEntity = key; break; }
  }

  const params = {
    q: financialQuery,
    language: 'en',
    sortBy: 'relevancy',
    pageSize: 20,          // fetch more, then filter down
    apiKey: NEWS_API_KEY,
  };

  // Try with domain filter first (more precise)
  try {
    const response = await axios.get(NEWS_BASE_URL, {
      params: { ...params, domains: FINANCIAL_DOMAINS },
      timeout: 12000,
    });
    let articles = response.data.articles || [];

    // Fallback: if domain-filtered gives < 3 results, retry without domain filter
    if (articles.length < 3) {
      console.log('[dataAgent] Domain-filtered returned few results, retrying broadly...');
      const fallback = await axios.get(NEWS_BASE_URL, { params, timeout: 12000 });
      articles = fallback.data.articles || [];
    }

    // Score and filter
    const scored = articles
      .filter(a => a.title && a.title !== '[Removed]')
      .map(a => ({ ...a, _score: scoreArticleRelevance(a, primaryEntity) }))
      .filter(a => a._score >= 2)
      .sort((a, b) => b._score - a._score)
      .slice(0, 10);

    console.log(`[dataAgent] ${articles.length} raw → ${scored.length} relevant articles`);

    return scored.map(a => ({
      title: a.title,
      description: a.description || '',
      source: a.source?.name || 'Unknown',
      url: a.url,
      publishedAt: a.publishedAt,
      relevanceScore: a._score,
    }));

  } catch (err) {
    console.error('[dataAgent] NewsAPI fetch failed:', err.message);
    return [];
  }
}