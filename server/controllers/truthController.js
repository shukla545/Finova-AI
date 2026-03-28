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
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const extractedText = await parsePDF(req.file.buffer);

    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(400).json({ error: 'Could not extract meaningful text from the PDF.' });
    }

    // Use first 1500 chars as the query context
    const query = extractedText.slice(0, 1500);
    const result = await runTruthAgent(query, 'pdf');
    return res.status(200).json({ ...result, extractedText: extractedText.slice(0, 500) + '...' });
  } catch (err) {
    console.error('[truthController] analyzePDF error:', err.message);
    return res.status(500).json({ error: err.message || 'PDF analysis failed.' });
  }
};