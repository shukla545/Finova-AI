import {
  extractTextFromPDF,
  parsePortfolioFromText,
  chatWithPortfolio,
} from "../services/finPilotService.js";

// In-memory session store (replace with Redis/MongoDB for production)
const portfolioSessions = new Map();

/**
 * POST /api/finpilot/upload
 * Accepts a PDF file, extracts and analyzes portfolio data
 */
export async function uploadPortfolio(req, res) {
  try {
    // ── Diagnostics on startup ──────────────────────────────────────
    console.log("[FinPilot] OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);
    console.log("[FinPilot] File received:", req.file ? `${req.file.originalname} (${req.file.size} bytes)` : "NONE");

    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded." });
    }

    // ── Step 1: PDF extraction ──────────────────────────────────────
    console.log("[FinPilot] Step 1: Extracting PDF text...");
    let rawText;
    try {
      rawText = await extractTextFromPDF(req.file.buffer);
      console.log("[FinPilot] Extracted text length:", rawText?.length ?? 0);
    } catch (pdfErr) {
      console.error("[FinPilot] PDF extraction failed:", pdfErr.message);
      return res.status(422).json({ error: `PDF extraction failed: ${pdfErr.message}` });
    }

    if (!rawText || rawText.trim().length < 50) {
      console.warn("[FinPilot] Text too short:", rawText?.trim().length);
      return res.status(422).json({
        error: "Could not extract meaningful text from this PDF. Make sure it's not a scanned image PDF.",
      });
    }

    // ── Step 2: OpenAI parsing ──────────────────────────────────────
    console.log("[FinPilot] Step 2: Sending to OpenAI for parsing...");
    let portfolioData;
    try {
      portfolioData = await parsePortfolioFromText(rawText);
      console.log("[FinPilot] Portfolio parsed successfully:", Object.keys(portfolioData));
    } catch (aiErr) {
      console.error("[FinPilot] OpenAI parsing failed:", aiErr.message);
      return res.status(500).json({ error: `AI parsing failed: ${aiErr.message}` });
    }

    // ── Step 3: Session creation ────────────────────────────────────
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    portfolioSessions.set(sessionId, {
      portfolio: portfolioData,
      history: [],
      createdAt: new Date(),
    });
    console.log("[FinPilot] Session created:", sessionId);

    // Clean old sessions (older than 2 hours)
    for (const [id, session] of portfolioSessions.entries()) {
      if (Date.now() - session.createdAt.getTime() > 2 * 60 * 60 * 1000) {
        portfolioSessions.delete(id);
      }
    }

    return res.status(200).json({
      success: true,
      sessionId,
      portfolio: portfolioData,
    });
  } catch (err) {
    console.error("[FinPilot] uploadPortfolio UNEXPECTED error:", err);
    return res.status(500).json({ error: `Unexpected error: ${err.message}` });
  }
}

/**
 * POST /api/finpilot/chat
 * Handles a chat message with full portfolio context
 */
export async function chatWithFinPilot(req, res) {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId and message are required." });
    }

    const session = portfolioSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found. Please re-upload your portfolio." });
    }

    const aiResponse = await chatWithPortfolio(
      session.portfolio,
      message,
      session.history
    );

    // Append to conversation history
    session.history.push({ role: "user", content: message });
    session.history.push({ role: "assistant", content: aiResponse });

    return res.status(200).json({
      success: true,
      response: aiResponse,
    });
  } catch (err) {
    console.error("[FinPilot] chatWithFinPilot error:", err);
    return res.status(500).json({ error: "AI response failed. Please try again." });
  }
}