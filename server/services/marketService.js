import yahooFinance from 'yahoo-finance2';

/**
 * Try to extract a stock ticker symbol from the query.
 * Very simple heuristic — looks for ALLCAPS tokens or known names.
 */
function extractTicker(query) {
  // Match typical ticker patterns: 1-5 uppercase letters
  const match = query.match(/\b([A-Z]{1,5})\b/);
  if (match) return match[1];

  // Common name → ticker mapping
  const nameMap = {
    reliance: 'RELIANCE.NS',
    tata: 'TATAMOTORS.NS',
    infosys: 'INFY',
    apple: 'AAPL',
    microsoft: 'MSFT',
    google: 'GOOGL',
    amazon: 'AMZN',
    tesla: 'TSLA',
    nvidia: 'NVDA',
    meta: 'META',
    hdfc: 'HDFCBANK.NS',
    wipro: 'WIPRO.NS',
  };

  const lower = query.toLowerCase();
  for (const [name, ticker] of Object.entries(nameMap)) {
    if (lower.includes(name)) return ticker;
  }

  return null;
}

/**
 * Fetch market quote data for a detected ticker.
 * Returns structured market data or null if unavailable.
 */
export async function fetchMarketData(query) {
  const ticker = extractTicker(query);
  if (!ticker) return null;

  try {
    const quote = await yahooFinance.quote(ticker);
    if (!quote) return null;

    return {
      ticker,
      companyName: quote.longName || quote.shortName || ticker,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent?.toFixed(2),
      high52w: quote.fiftyTwoWeekHigh,
      low52w: quote.fiftyTwoWeekLow,
      marketCap: quote.marketCap,
      volume: quote.regularMarketVolume,
      peRatio: quote.trailingPE,
      currency: quote.currency,
    };
  } catch (err) {
    console.warn('[marketService] Yahoo Finance fetch failed for', ticker, ':', err.message);
    return null;
  }
}