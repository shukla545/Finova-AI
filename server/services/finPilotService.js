import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Extracts raw text from a PDF buffer.
 * New pdf-parse API: data is passed to the constructor, then getText() is called.
 */
export async function extractTextFromPDF(buffer) {
  // Ensure we pass a Buffer (not Uint8Array) — the lib handles conversion internally
  const parser = new PDFParse({ data: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer) });
  const result = await parser.getText();
  return result.text;
}

/**
 * Uses OpenAI to parse raw PDF text into structured portfolio JSON
 */
export async function parsePortfolioFromText(rawText) {
  const systemPrompt = `You are a financial data extraction engine. 
Extract portfolio information from the given text and return ONLY valid JSON.
The JSON must follow this exact structure:
{
  "holdings": [
    { "symbol": "AAPL", "name": "Apple Inc.", "allocation": 25.5, "sector": "Technology" }
  ],
  "totalValue": 100000,
  "currency": "USD",
  "riskLevel": "Moderate",
  "riskScore": 6,
  "diversificationScore": 7,
  "topSectors": ["Technology", "Finance"],
  "summary": "Brief 1-2 sentence portfolio summary"
}
- riskLevel: one of "Conservative", "Moderate", "Aggressive"
- riskScore: 1-10 (10 = highest risk)
- diversificationScore: 1-10 (10 = best diversified)
- allocation values must sum to ~100
If certain data is missing, make reasonable estimates based on context.
Return ONLY the JSON object, no markdown, no explanation.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Extract portfolio data from this text:\n\n${rawText.slice(0, 6000)}` },
    ],
    temperature: 0.1,
    max_tokens: 1500,
  });

  const content = response.choices[0].message.content.trim();
  try {
    return JSON.parse(content);
  } catch {
    // Attempt to extract JSON block if model adds extra text
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Failed to parse portfolio JSON from AI response");
  }
}

/**
 * Main AI chat — portfolio-aware financial advisor
 */
export async function chatWithPortfolio(portfolioData, userMessage, conversationHistory = []) {
  const portfolioContext = JSON.stringify(portfolioData, null, 2);

  const systemPrompt = `You are FinPilot, an elite AI financial advisor embedded in the FinovaAI platform.
You ONLY discuss the user's actual portfolio data provided below. Never make up data.
Be conversational, concise, and insightful — like a Bloomberg analyst meeting a friendly advisor.

USER'S PORTFOLIO:
${portfolioContext}

BEHAVIOR RULES:
- Give actionable, specific advice based on their actual holdings
- Highlight risks clearly but without panic
- Use plain language with occasional financial terminology
- Keep responses under 150 words unless deep analysis is requested
- Structure longer responses with short bullet points
- Always ground suggestions in their actual portfolio data
- For greetings, briefly introduce yourself and summarize their portfolio health`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-8), // Keep last 8 turns for context
    { role: "user", content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 400,
  });

  return response.choices[0].message.content;
}