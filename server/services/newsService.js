import fs from "fs";
import path from "path";
import Parser from "rss-parser";
import * as cheerio from "cheerio";

const parser = new Parser({
  timeout: 15000,
  customFields: {
    item: ["media:content", "media:thumbnail", "content:encoded"],
  },
});

const CACHE_FILE = path.join(process.cwd(), "cache", "newsCache.json");
const CACHE_DURATION = 1000 * 60 * 15;
const DAYS_BACK = 7;

const EMPTY_RESPONSE = {
  financialNews: [],
  researchReports: [],
  marketInsights: [],
  customerInformation: [],
  regulatoryData: [],
};

const CATEGORY_QUERIES = {
  financialNews: [
    {
      source: "Google News",
      url: "https://news.google.com/rss/search?q=India+finance+banking+economy+when%3A7d&hl=en-IN&gl=IN&ceid=IN:en",
    },
    {
      source: "Google News",
      url: "https://news.google.com/rss/search?q=site%3Amoneycontrol.com+India+finance+when%3A7d&hl=en-IN&gl=IN&ceid=IN:en",
    },
    {
      source: "Moneycontrol",
      url: "https://www.moneycontrol.com/rss/business.xml",
    },
  ],
  researchReports: [
    {
      source: "Google News",
      url: "https://news.google.com/rss/search?q=India+brokerage+report+research+stocks+when%3A7d&hl=en-IN&gl=IN&ceid=IN:en",
    },
    {
      source: "Google News",
      url: "https://news.google.com/rss/search?q=site%3Aeconomictimes.indiatimes.com+brokerage+report+India+when%3A7d&hl=en-IN&gl=IN&ceid=IN:en",
    },
  ],
  marketInsights: [
    {
      source: "Google News",
      url: "https://news.google.com/rss/search?q=India+stock+market+Sensex+Nifty+when%3A7d&hl=en-IN&gl=IN&ceid=IN:en",
    },
    {
      source: "Moneycontrol",
      url: "https://www.moneycontrol.com/rss/MCtopnews.xml",
    },
    {
      source: "Google News",
      url: "https://news.google.com/rss/search?q=site%3Amoneycontrol.com+Sensex+Nifty+when%3A7d&hl=en-IN&gl=IN&ceid=IN:en",
    },
  ],
  customerInformation: [
    {
      source: "Google News",
      url: "https://news.google.com/rss/search?q=India+personal+finance+UPI+credit+card+customer+when%3A7d&hl=en-IN&gl=IN&ceid=IN:en",
    },
    {
      source: "Google News",
      url: "https://news.google.com/rss/search?q=site%3Amoneycontrol.com+personal+finance+India+when%3A7d&hl=en-IN&gl=IN&ceid=IN:en",
    },
  ],
  regulatoryData: [
    {
      source: "Google News",
      url: "https://news.google.com/rss/search?q=India+RBI+SEBI+regulation+compliance+when%3A7d&hl=en-IN&gl=IN&ceid=IN:en",
    },
  ],
};

const ensureCacheDir = () => {
  const dir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const readCache = () => {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  try {
    ensureCacheDir();
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify(
        {
          timestamp: Date.now(),
          data,
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error("Cache write failed:", error.message);
  }
};

const toAbsoluteUrl = (url) => {
  try {
    return new URL(url).toString();
  } catch {
    return "#";
  }
};

const cleanText = (value = "") =>
  value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const parseGoogleNewsOriginalLink = (link) => {
  try {
    const url = new URL(link);
    const target = url.searchParams.get("url");
    if (target) return target;
    return link;
  } catch {
    return link;
  }
};

const extractSourceName = (item, fallbackSource = "Finance Source") => {
  if (item.creator) return cleanText(item.creator);

  if (item.source && typeof item.source === "object" && item.source._) {
    return cleanText(item.source._);
  }

  if (item.source && typeof item.source === "string") {
    return cleanText(item.source);
  }

  const title = item.title || "";
  if (title.includes(" - ")) {
    const lastChunk = title.split(" - ").pop();
    if (lastChunk && lastChunk.length < 60) return cleanText(lastChunk);
  }

  return fallbackSource;
};

const normalizeItem = (item, fallbackSource = "Finance Source") => {
  const rawLink = item.link || item.guid || "#";
  const link =
    rawLink.includes("news.google.com") ? parseGoogleNewsOriginalLink(rawLink) : rawLink;

  return {
    title: cleanText(item.title || "Untitled article"),
    description: cleanText(
      item.contentSnippet ||
        item.content ||
        item.summary ||
        item["content:encoded"] ||
        ""
    ),
    source: extractSourceName(item, fallbackSource),
    link: toAbsoluteUrl(link),
    publishedAt:
      item.isoDate ||
      item.pubDate ||
      item.published ||
      new Date().toISOString(),
  };
};

const isValidArticle = (article) => {
  if (!article.title || article.title.length < 12) return false;
  if (!article.link || article.link === "#") return false;
  return true;
};

const isWithinLastWeek = (publishedAt) => {
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = Date.now() - DAYS_BACK * 24 * 60 * 60 * 1000;
  return date.getTime() >= cutoff;
};

const sortLatestFirst = (a, b) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

const dedupeArticles = (articles) => {
  const seen = new Set();
  return articles.filter((item) => {
    const key = `${item.title}|${item.link}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const fetchRssFeed = async (feedConfig) => {
  try {
    const feed = await parser.parseURL(feedConfig.url);
    return (feed.items || [])
      .map((item) => normalizeItem(item, feedConfig.source))
      .filter(isValidArticle);
  } catch (error) {
    console.error(`RSS fetch failed for ${feedConfig.url}:`, error.message);
    return [];
  }
};

const fetchSebiPressReleases = async () => {
  try {
    const response = await fetch(
      "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=6&smid=0&ssid=23"
    );
    const html = await response.text();
    const $ = cheerio.load(html);

    const articles = [];

    $("table tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < 3) return;

      const dateText = cleanText($(cells[0]).text());
      const titleAnchor = $(cells[2]).find("a").first();
      const title = cleanText(titleAnchor.text());
      const href = titleAnchor.attr("href");

      if (!title || !href) return;

      const parsedDate = new Date(dateText);
      if (Number.isNaN(parsedDate.getTime())) return;

      articles.push({
        title,
        description: "Latest SEBI press release and regulatory update.",
        source: "SEBI",
        link: href.startsWith("http") ? href : `https://www.sebi.gov.in${href}`,
        publishedAt: parsedDate.toISOString(),
      });
    });

    return articles.filter((item) => isWithinLastWeek(item.publishedAt));
  } catch (error) {
    console.error("SEBI scrape failed:", error.message);
    return [];
  }
};

const fetchRbiPressReleases = async () => {
  try {
    const response = await fetch(
      "https://www.rbi.org.in/commonman/English/Scripts/PressReleases.aspx"
    );
    const html = await response.text();
    const $ = cheerio.load(html);

    const articles = [];

    $("a").each((_, el) => {
      const title = cleanText($(el).text());
      const href = $(el).attr("href");

      if (!href || !title) return;
      if (!/press/i.test(title) && !/bank|liquidity|policy|repo|rbi/i.test(title)) return;

      const rowText = cleanText($(el).parent().parent().text());
      const dateMatch = rowText.match(
        /\b(\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{1,2}-[A-Za-z]{3}-\d{4})\b/
      );

      let publishedAt = new Date().toISOString();
      if (dateMatch) {
        const parsedDate = new Date(dateMatch[0]);
        if (!Number.isNaN(parsedDate.getTime())) {
          publishedAt = parsedDate.toISOString();
        }
      }

      articles.push({
        title,
        description: "Latest RBI announcement and banking/regulatory release.",
        source: "RBI",
        link: href.startsWith("http") ? href : `https://www.rbi.org.in${href}`,
        publishedAt,
      });
    });

    return dedupeArticles(articles).filter((item) => isWithinLastWeek(item.publishedAt));
  } catch (error) {
    console.error("RBI scrape failed:", error.message);
    return [];
  }
};

const categoryScore = (text, keywords) => {
  let score = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword)) score += 1;
  }
  return score;
};

const CATEGORY_KEYWORDS = {
  financialNews: [
    "finance",
    "bank",
    "banking",
    "economy",
    "rupee",
    "loan",
    "deposit",
    "fund",
    "fiscal",
    "borrowing",
  ],
  researchReports: [
    "report",
    "research",
    "brokerage",
    "outlook",
    "forecast",
    "survey",
    "analysis",
    "rating",
    "target",
    "estimate",
  ],
  marketInsights: [
    "sensex",
    "nifty",
    "market",
    "stocks",
    "shares",
    "equity",
    "trading",
    "fii",
    "dii",
    "midcap",
    "smallcap",
    "investor",
  ],
  customerInformation: [
    "customer",
    "consumer",
    "user",
    "users",
    "retail",
    "personal finance",
    "credit card",
    "upi",
    "fintech",
    "wallet",
    "payment",
    "depositor",
    "borrower",
  ],
  regulatoryData: [
    "rbi",
    "sebi",
    "regulation",
    "regulatory",
    "compliance",
    "policy",
    "government",
    "guideline",
    "circular",
    "ministry",
    "tax",
    "board meeting",
    "supervision",
  ],
};

const categorizeArticle = (article) => {
  const text = `${article.title} ${article.description} ${article.source}`.toLowerCase();

  const scores = {
    financialNews: categoryScore(text, CATEGORY_KEYWORDS.financialNews),
    researchReports: categoryScore(text, CATEGORY_KEYWORDS.researchReports),
    marketInsights: categoryScore(text, CATEGORY_KEYWORDS.marketInsights),
    customerInformation: categoryScore(text, CATEGORY_KEYWORDS.customerInformation),
    regulatoryData: categoryScore(text, CATEGORY_KEYWORDS.regulatoryData),
  };

  let bestCategory = "financialNews";
  let bestScore = 0;

  for (const [category, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
};

const backfillCategory = (grouped, allArticles, categoryKey, minItems = 6) => {
  if (grouped[categoryKey].length >= minItems) return;

  const existing = new Set(grouped[categoryKey].map((a) => a.link));
  const keywords = CATEGORY_KEYWORDS[categoryKey] || [];

  const candidates = allArticles
    .filter((item) => !existing.has(item.link))
    .map((article) => {
      const text = `${article.title} ${article.description} ${article.source}`.toLowerCase();
      return {
        article,
        score: categoryScore(text, keywords),
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return sortLatestFirst(a.article, b.article);
    })
    .map((entry) => entry.article);

  for (const article of candidates) {
    if (grouped[categoryKey].length >= minItems) break;
    grouped[categoryKey].push(article);
  }
};

const buildCategorized = (articles) => {
  const grouped = {
    financialNews: [],
    researchReports: [],
    marketInsights: [],
    customerInformation: [],
    regulatoryData: [],
  };

  for (const article of articles) {
    const category = categorizeArticle(article);
    grouped[category].push(article);
  }

  backfillCategory(grouped, articles, "financialNews", 8);
  backfillCategory(grouped, articles, "researchReports", 8);
  backfillCategory(grouped, articles, "marketInsights", 8);
  backfillCategory(grouped, articles, "customerInformation", 8);
  backfillCategory(grouped, articles, "regulatoryData", 8);

  Object.keys(grouped).forEach((key) => {
    grouped[key] = dedupeArticles(grouped[key]).sort(sortLatestFirst);
  });

  return grouped;
};

const fetchCategoryFeeds = async () => {
  const entries = Object.entries(CATEGORY_QUERIES);

  const results = await Promise.all(
    entries.map(async ([categoryKey, feeds]) => {
      const feedResults = await Promise.all(feeds.map(fetchRssFeed));
      return [categoryKey, feedResults.flat()];
    })
  );

  return Object.fromEntries(results);
};

export const getCategorizedFinanceNews = async (forceRefresh = false) => {
  if (!forceRefresh) {
    const cache = readCache();
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return cache.data;
    }
  }

  const [feedBuckets, sebiArticles, rbiArticles] = await Promise.all([
    fetchCategoryFeeds(),
    fetchSebiPressReleases(),
    fetchRbiPressReleases(),
  ]);

  let allArticles = [
    ...(feedBuckets.financialNews || []),
    ...(feedBuckets.researchReports || []),
    ...(feedBuckets.marketInsights || []),
    ...(feedBuckets.customerInformation || []),
    ...(feedBuckets.regulatoryData || []),
    ...sebiArticles,
    ...rbiArticles,
  ];

  allArticles = dedupeArticles(allArticles)
    .filter((article) => isWithinLastWeek(article.publishedAt))
    .sort(sortLatestFirst);

  const categorized = buildCategorized(allArticles);

  writeCache(categorized);
  return categorized || EMPTY_RESPONSE;
};