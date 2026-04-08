import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Extract text from a PDF using pdf-parse.
 * Falls back gracefully if the PDF can't be parsed.
 * 
 * @param {Buffer|string} source - A Buffer of the PDF data, or a URL string.
 * @param {object} options - { maxPages: number } to limit extraction.
 * @returns {Promise<string>} The extracted text content.
 */
export async function extractTextFromPdf(source, options = {}) {
  const { maxPages = 10 } = options;

  try {
    // Dynamic import to avoid issues if not installed
    const pdfParse = (await import('pdf-parse')).default;

    let dataBuffer;

    if (Buffer.isBuffer(source)) {
      dataBuffer = source;
    } else if (typeof source === 'string' && source.startsWith('http')) {
      // Fetch remote PDF
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      dataBuffer = Buffer.from(arrayBuffer);
    } else if (typeof source === 'string') {
      // Local file path
      dataBuffer = fs.readFileSync(source);
    } else {
      throw new Error('Invalid source: must be a Buffer, URL string, or file path.');
    }

    const result = await pdfParse(dataBuffer, {
      max: maxPages, // Limit pages for performance
    });

    return result.text || '';
  } catch (error) {
    console.error('PDF text extraction failed:', error.message);
    return '';
  }
}
