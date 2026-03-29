import { runTruthAgent } from '../services/truthAgent.js';
import { parsePDF } from '../services/pdfService.js';

export const analyzeQuery = async (req, res) => {
  try {
    const { query, mode } = req.body;

    if (!query || query.trim().length < 3) {
      return res.status(400).json({ error: 'Query must be at least 3 characters.' });
    }

    const result = await runTruthAgent(query.trim(), mode || 'text');
    return res.status(200).json(result);
  } catch (err) {
    console.error('[truthController] analyzeQuery error:', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
};

export const analyzePDF = async (req, res) => {
  try {
    // Check multer uploaded a file
    if (!req.file) {
      return res.status(400).json({
        error: 'No PDF file received. Please select a PDF file and try again.',
      });
    }

    console.log(`[truthController] PDF received: ${req.file.originalname} (${req.file.size} bytes)`);

    // Parse PDF
    let extractedText;
    try {
      extractedText = await parsePDF(req.file.buffer);
    } catch (parseErr) {
      return res.status(422).json({ error: parseErr.message });
    }

    // Use first 2000 chars as the analysis query
   const safeText = extractedText || "No readable content found in PDF.";

const query = safeText
  .slice(0, 2000)
  .replace(/\s+/g, ' ')
  .trim();

    // Run truth analysis
    const result = await runTruthAgent(query, 'pdf');

    // Attach a safe preview of the extracted text
    return res.status(200).json({
      ...result,
      extractedText: extractedText.slice(0, 600) + (extractedText.length > 600 ? '…' : ''),
      pdfName: req.file.originalname,
      pdfPages: undefined, // populated by pdfService if needed
    });

  } catch (err) {
    console.error('[truthController] analyzePDF error:', err.message);
    return res.status(500).json({
      error: err.message || 'PDF analysis failed. Please try again.',
    });
  }
};