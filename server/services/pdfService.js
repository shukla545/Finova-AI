import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function parsePDF(buffer) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;

    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const strings = content.items.map(item => item.str).join(' ');
      text += strings + '\n';
    }

    text = text.trim();

    if (text.length < 20) {
      console.log('[pdfService] Low text detected, using fallback...');

      return `
This document appears to be a scanned or image-based financial report.
Limited text could be extracted.

Please analyze based on general financial patterns and possible interpretations.
`;
    }

    console.log(`[pdfService] Extracted ${text.length} chars from PDF (${pdf.numPages} pages)`);

    return text;

  } catch (err) {
    console.error('[pdfService] Parse error:', err.message);

    return `
Unable to fully extract content from the PDF.
Please analyze based on possible financial context and assumptions.
`;
  }
}