import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Parse a PDF buffer and return extracted text.
 */
export async function parsePDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('[pdfService] PDF parse error:', err.message);
    throw new Error('Failed to parse PDF. Ensure it is a valid, text-based PDF.');
  }
}