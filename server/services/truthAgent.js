import axios from 'axios';
import OpenAI from 'openai';
import { fetchFinancialNews } from './dataAgent.js';
import { fetchMarketData } from './marketService.js';

// ─── Lazy OpenAI init (avoids dotenv timing issue) ───────────────────────────
let _openai = null;
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

const HF_SENTIMENT_URL = 'https://api-inference.huggingface.co/models/ProsusAI/finbert';

// ─── Finance gate keywords ────────────────────────────────────────────────────
const FINANCE_KEYWORDS = [
  'stock', 'share', 'invest', 'market', 'fund', 'crypto', 'bitcoin', 'equity',
  'portfolio', 'dividend', 'revenue', 'profit', 'loss', 'earnings', 'ipo',
  'bond', 'nifty', 'sensex', 'nasdaq', 'dow', 'financial', 'economy', 'gdp',
  'inflation', 'interest rate', 'rbi', 'fed', 'sebi', 'mutual fund', 'etf',
  'debt', 'asset', 'valuation', 'hedge', 'forex', 'commodity', 'oil', 'gold',
  'silver', 'rupee', 'dollar', 'currency', 'bank', 'npa', 'loan', 'credit',
  'trading', 'bull', 'bear', 'rally', 'crash', 'correction', 'sector',
  'quarterly', 'annual', 'report', 'balance sheet', 'p/e', 'pe ratio',
  'reliance', 'tata', 'infosys', 'wipro', 'hdfc', 'icici', 'apple', 'tesla',
  'microsoft', 'google', 'amazon', 'nvidia', 'meta', 'adani', 'bajaj',
  'sbi', 'axis', 'kotak', 'zomato', 'paytm', 'ola', 'ethereum', 'nse', 'bse',
];

function isFinanceRelated(query) {
  const lower = query.toLowerCase();
  return FINANCE_KEYWORDS.some(k => lower.includes(k));
}

// ─── Keyword-based sentiment scorer ──────────────────────────────────────────
/**
 * Scores a text snippet using bullish/bearish keyword dictionaries.
 * Returns { label, score, strength } where strength is 0–1.
 */
const BULLISH_WORDS = [
  'surge', 'soar', 'rally', 'gain', 'rise', 'jump', 'climb', 'beat',
  'exceed', 'outperform', 'record', 'high', 'profit', 'growth', 'bullish',
  'upgrade', 'buy', 'strong', 'positive', 'robust', 'boom', 'momentum',
  'breakout', 'upside', 'opportunity', 'optimistic', 'recovery', 'rebound',
  'expansion', 'dividend', 'revenue growth', 'earnings beat', 'target raised',
];
const BEARISH_WORDS = [
  'fall', 'drop', 'crash', 'plunge', 'decline', 'loss', 'miss', 'below',
  'underperform', 'weak', 'bearish', 'downgrade', 'sell', 'risk', 'concern',
  'warning', 'debt', 'default', 'recession', 'layoff', 'cut', 'reduce',
  'disappoint', 'slump', 'correction', 'selloff', 'downside', 'headwind',
  'uncertainty', 'slowdown', 'earnings miss', 'target cut', 'bankruptcy',
];

function keywordSentimentScore(text) {
  const lower = text.toLowerCase();
  let bullishHits = 0;
  let bearishHits = 0;

  BULLISH_WORDS.forEach(w => { if (lower.includes(w)) bullishHits++; });
  BEARISH_WORDS.forEach(w => { if (lower.includes(w)) bearishHits++; });

  const total = bullishHits + bearishHits;
  if (total === 0) return { label: 'neutral', score: 0.5, strength: 0 };

  const bullishRatio = bullishHits / total;
  const strength = Math.min(1, total / 5); // caps at 5 keyword hits = full strength

  if (bullishRatio >= 0.65) return { label: 'positive', score: 0.5 + bullishRatio * 0.5, strength };
  if (bullishRatio <= 0.35) return { label: 'negative', score: 0.5 - (1 - bullishRatio) * 0.5, strength };
  return { label: 'neutral', score: 0.5, strength: strength * 0.5 };
}

// ─── HuggingFace FinBERT sentiment ───────────────────────────────────────────
async function runHuggingFaceSentiment(texts) {
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
  if (!HF_API_KEY) {
    console.warn('[truthAgent] No HF key — using keyword fallback only.');
    return null; // signal to use keyword-only
  }

  try {
    const response = await axios.post(
      HF_SENTIMENT_URL,
      { inputs: texts },
      {
        headers: { Authorization: `Bearer ${HF_API_KEY}` },
        timeout: 20000,
      }
    );

    const results = response.data;
    if (!Array.isArray(results)) return null;

    return results.map(arr => {
      if (!Array.isArray(arr) || arr.length === 0) return null;
      const top = arr.reduce((best, cur) => (cur.score > best.score ? cur : best), arr[0]);
      return {
        label: top.label?.toLowerCase() || 'neutral',
        score: top.score,
        allScores: arr, // keep all scores for confidence analysis
      };
    });
  } catch (err) {
    console.warn('[truthAgent] HuggingFace error:', err.message);
    return null;
  }
}

// ─── Hybrid sentiment fusion ──────────────────────────────────────────────────
/**
 * Fuses FinBERT output with keyword scores.
 * FinBERT is weighted 65%, keyword 35%.
 * If FinBERT is low-confidence (< 0.55), keyword gets more weight.
 */
function fuseSentiments(hfResult, keywordResult) {
  if (!hfResult) {
    // No HF data — use keyword only
    return {
      label: keywordResult.label,
      score: keywordResult.score,
      confidence: keywordResult.strength,
      source: 'keyword',
    };
  }

  const hfConfident = hfResult.score >= 0.55;
  const hfWeight = hfConfident ? 0.65 : 0.35;
  const kwWeight = 1 - hfWeight;

  // Convert labels to numeric: positive=1, neutral=0, negative=-1
  const labelToNum = { positive: 1, neutral: 0, negative: -1 };
  const numToLabel = (n) => n > 0.2 ? 'positive' : n < -0.2 ? 'negative' : 'neutral';

  const hfNum = labelToNum[hfResult.label] ?? 0;
  const kwNum = labelToNum[keywordResult.label] ?? 0;
  const fusedNum = hfNum * hfWeight + kwNum * kwWeight;

  // Fused confidence: average of HF score and keyword strength
  const fusedConfidence = hfResult.score * hfWeight + keywordResult.strength * kwWeight;

  return {
    label: numToLabel(fusedNum),
    score: 0.5 + fusedNum * 0.5,
    confidence: fusedConfidence,
    source: 'hybrid',
  };
}

// ─── Sentiment aggregator ─────────────────────────────────────────────────────
/**
 * Aggregates per-article sentiments into a signal summary.
 * Weights high-confidence articles more heavily.
 */
function aggregateSentiments(fusedSentiments) {
  const counts = { positive: 0, negative: 0, neutral: 0 };
  let weightedBullish = 0;
  let weightedBearish = 0;
  let totalWeight = 0;

  fusedSentiments.forEach(s => {
    const w = 0.4 + (s.confidence || 0) * 0.6; // weight = 0.4–1.0 based on confidence
    totalWeight += w;
    if (s.label === 'positive') { counts.positive++; weightedBullish += w; }
    else if (s.label === 'negative') { counts.negative++; weightedBearish += w; }
    else counts.neutral++;
  });

  const bullishRatio = totalWeight > 0 ? weightedBullish / totalWeight : 0;
  const bearishRatio = totalWeight > 0 ? weightedBearish / totalWeight : 0;

  let dominantLabel = 'Neutral';
  if (bullishRatio > 0.45) dominantLabel = 'Bullish';
  else if (bearishRatio > 0.45) dominantLabel = 'Bearish';

  // Agreement score: how strongly sources align (0–1)
  const total = fusedSentiments.length || 1;
  const dominantCount = Math.max(counts.positive, counts.negative, counts.neutral);
  const agreementScore = dominantCount / total;

  // Conflict: significant split between positive and negative
  const conflictDetected =
    counts.positive >= 2 &&
    counts.negative >= 2 &&
    Math.abs(counts.positive - counts.negative) <= Math.floor(total * 0.3);

  return { dominantLabel, counts, agreementScore, conflictDetected, bullishRatio, bearishRatio };
}

// ─── Trust score calculator ───────────────────────────────────────────────────
/**
 * Calculates a dynamic trust score (0–100) based on multiple signals.
 *
 * Factors:
 * 1. Source agreement      (0–35 pts) — how much sources align
 * 2. Sentiment strength    (0–25 pts) — how decisive the sentiment is
 * 3. Data relevance        (0–20 pts) — article count + quality
 * 4. Conflict penalty      (0–15 pts deducted)
 * 5. Market data bonus     (0–10 pts) — confirmed by live market data
 */
function calculateTrustScore({
  agreementScore,
  bullishRatio,
  bearishRatio,
  conflictDetected,
  articleCount,
  avgRelevanceScore,
  marketData,
  sentimentCounts,
}) {
  let score = 0;

  // 1. Source agreement (0–35)
  // Strong agreement (>70%) = 28–35, moderate (50–70%) = 15–27, weak = 0–14
  score += Math.round(agreementScore * 35);

  // 2. Sentiment strength (0–25)
  // How far from neutral are we? max(bullish, bearish) ratio
  const dominance = Math.max(bullishRatio, bearishRatio);
  const sentimentStrength = Math.max(0, (dominance - 0.33) / 0.67); // 0 at 33%, 1 at 100%
  score += Math.round(sentimentStrength * 25);

  // 3. Data relevance (0–20)
  // More articles = more data; higher avg relevance = better quality
  const articleBonus = Math.min(10, articleCount * 1.5); // up to 10 pts for 7+ articles
  const relevanceBonus = Math.min(10, (avgRelevanceScore / 10) * 10);
  score += Math.round(articleBonus + relevanceBonus);

  // 4. Conflict penalty (−15 max)
  if (conflictDetected) score -= 15;

  // Noise penalty: if mostly neutral (weak data)
  const total = sentimentCounts.positive + sentimentCounts.negative + sentimentCounts.neutral;
  const neutralRatio = total > 0 ? sentimentCounts.neutral / total : 1;
  if (neutralRatio > 0.6) score -= Math.round(neutralRatio * 10);

  // 5. Market data confirmation bonus (0–10)
  if (marketData) {
    // If market trend aligns with sentiment
    const marketBullish = (marketData.changePercent || 0) > 0;
    const sentimentBullish = bullishRatio > bearishRatio;
    if (marketBullish === sentimentBullish) score += 10;
    else score += 3; // still some value even if misaligned
  }

  // Clamp between 5 and 95 (never absolute 0 or 100 — AI is never certain)
  return Math.min(95, Math.max(5, score));
}

// ─── Signal strength classifier ───────────────────────────────────────────────
function classifySignalStrength(trustScore, agreementScore, articleCount) {
  if (trustScore >= 70 && agreementScore >= 0.65 && articleCount >= 5) return 'Strong Signal';
  if (trustScore >= 45) return 'Moderate Signal';
  return 'Weak Signal';
}

// ─── OpenAI reasoning ─────────────────────────────────────────────────────────
async function runOpenAIReasoning({
  query, articles, fusedSentiments, trustScore, signalStrength,
  agreementScore, conflictDetected, marketData, mode,
}) {
  const articleSummaries = articles.slice(0, 8).map((a, i) => {
    const s = fusedSentiments[i] || { label: 'neutral', confidence: 0.5, source: 'keyword' };
    return [
      `[${i + 1}] ${a.source}`,
      `Headline: ${a.title}`,
      `Snippet: ${a.description?.slice(0, 200)}`,
      `Sentiment: ${s.label} | Confidence: ${((s.confidence || 0.5) * 100).toFixed(0)}% | Method: ${s.source}`,
    ].join('\n');
  }).join('\n\n');

  const marketCtx = marketData ? `
Live Market Data:
- Ticker: ${marketData.ticker} | Price: ${marketData.currency} ${marketData.price}
- Day Change: ${marketData.changePercent}% | 52W High: ${marketData.high52w} | Low: ${marketData.low52w}
- P/E Ratio: ${marketData.peRatio || 'N/A'} | Market Cap: ${marketData.marketCap ? (marketData.marketCap / 1e9).toFixed(1) + 'B' : 'N/A'}` : '';

  const systemContext = `
Pre-computed signals (DO NOT ignore these — use them to anchor your response):
- Calculated Trust Score: ${trustScore}/100
- Signal Strength: ${signalStrength}
- Source Agreement: ${(agreementScore * 100).toFixed(0)}%
- Conflict Detected: ${conflictDetected}`;

  const prompt = `You are a senior financial analyst AI. Evaluate this financial query using the provided news data and pre-computed signals.

QUERY: "${query}"
MODE: ${mode.toUpperCase()}
${systemContext}

NEWS ARTICLES:
${articleSummaries || 'No articles found.'}
${marketCtx}

INSTRUCTIONS:
1. Use the pre-computed trust score (${trustScore}) as your anchor — do NOT return a wildly different number without strong reason.
2. Identify where sources AGREE and where they CONFLICT.
3. Detect BIAS: sensationalism, one-sided framing, clickbait, paid promotion.
4. Sentiment must be DECISIVE — avoid defaulting to Neutral unless data is genuinely mixed.
5. Give a 3–5 sentence actionable explanation for a retail investor.

Respond ONLY in this exact JSON (no markdown, no extra text):
{
  "trustScore": <use ${trustScore} ± 10 max>,
  "overallSentiment": "<Bullish | Bearish | Neutral>",
  "biasDetected": "<None | Low | Medium | High>",
  "biasExplanation": "<one concise sentence>",
  "conflicts": ["<specific conflict between sources if any>"],
  "explanation": "<3-5 sentences, specific and actionable for a retail investor>",
  "keyInsights": ["<specific data point or insight>", "<another insight>", "<third insight>"]
}`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.25,
    max_tokens: 900,
  });

  const raw = response.choices[0]?.message?.content || '{}';
  const clean = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(clean);
    // Sanity clamp: don't let GPT override our computed score wildly
    const gptScore = parsed.trustScore ?? trustScore;
    const finalScore = Math.round(
      gptScore * 0.4 + trustScore * 0.6 // 60% algorithmic, 40% GPT
    );
    return { ...parsed, trustScore: Math.min(95, Math.max(5, finalScore)) };
  } catch {
    return {
      trustScore,
      overallSentiment: 'Neutral',
      biasDetected: 'Low',
      biasExplanation: 'AI response could not be parsed.',
      conflicts: [],
      explanation: raw.slice(0, 400),
      keyInsights: [],
    };
  }
}

// ─── Main orchestrator ────────────────────────────────────────────────────────
export async function runTruthAgent(query, mode = 'text') {
  // Gate check
  if (!isFinanceRelated(query)) {
    return {
      error: true,
      message: '🚫 Truth Agent is restricted to finance-related queries only. Please ask about stocks, markets, investments, or financial reports.',
    };
  }

  // Step 1: Fetch filtered, relevant news
  const articles = await fetchFinancialNews(query);
  console.log(`[truthAgent] ${articles.length} articles after filtering`);

  // Step 2: Market data (best effort)
  const marketData = await fetchMarketData(query);

  // Step 3: Keyword sentiment on all articles (always available, fast)
  const keywordSentiments = articles.map(a =>
    keywordSentimentScore(`${a.title} ${a.description}`)
  );

  // Step 4: HuggingFace FinBERT sentiment (async, may fail gracefully)
  let hfSentiments = null;
  if (articles.length > 0) {
    const texts = articles.map(a => `${a.title}. ${a.description || ''}`.slice(0, 500));
    hfSentiments = await runHuggingFaceSentiment(texts);
  }

  // Step 5: Fuse HF + keyword signals per article
  const fusedSentiments = articles.map((_, i) => {
    const hf = hfSentiments?.[i] || null;
    const kw = keywordSentiments[i];
    return fuseSentiments(hf, kw);
  });

  // Step 6: Aggregate into consensus
  const {
    dominantLabel, counts, agreementScore,
    conflictDetected, bullishRatio, bearishRatio,
  } = aggregateSentiments(fusedSentiments);

  // Step 7: Calculate algorithmic trust score
  const avgRelevanceScore = articles.length > 0
    ? articles.reduce((sum, a) => sum + (a.relevanceScore || 5), 0) / articles.length
    : 0;

  const trustScore = calculateTrustScore({
    agreementScore,
    bullishRatio,
    bearishRatio,
    conflictDetected,
    articleCount: articles.length,
    avgRelevanceScore,
    marketData,
    sentimentCounts: counts,
  });

  // Step 8: Signal strength
  const signalStrength = classifySignalStrength(trustScore, agreementScore, articles.length);

  // Step 9: OpenAI reasoning (uses our pre-computed score as anchor)
  const openAIResult = await runOpenAIReasoning({
    query, articles, fusedSentiments, trustScore, signalStrength,
    agreementScore, conflictDetected, marketData, mode,
  });

  // Step 10: Compose final response
  return {
    query,
    mode,
    trustScore: openAIResult.trustScore,
    sentiment: openAIResult.overallSentiment || dominantLabel,
    signalStrength,
    biasDetected: openAIResult.biasDetected || 'Low',
    biasExplanation: openAIResult.biasExplanation || '',
    conflicts: openAIResult.conflicts || [],
    conflictDetected,
    explanation: openAIResult.explanation || '',
    keyInsights: openAIResult.keyInsights || [],
    sentimentBreakdown: counts,
    agreementScore: Math.round(agreementScore * 100),
    marketData: marketData || null,
    sources: articles.map((a, i) => ({
      title: a.title,
      source: a.source,
      url: a.url,
      publishedAt: a.publishedAt,
      sentiment: fusedSentiments[i]?.label || 'neutral',
      confidence: fusedSentiments[i]?.confidence || 0.5,
      relevanceScore: a.relevanceScore,
    })),
    totalSources: articles.length,
    analyzedAt: new Date().toISOString(),
    _debug: {
      rawTrustScore: trustScore,
      hfAvailable: hfSentiments !== null,
      avgRelevance: avgRelevanceScore.toFixed(1),
      agreementPct: (agreementScore * 100).toFixed(0) + '%',
    },
  };
}