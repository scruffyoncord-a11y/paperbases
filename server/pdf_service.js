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
    const pdfParse = (await import('pdf-parse')).default;
    let dataBuffer;

    if (Buffer.isBuffer(source)) {
      dataBuffer = source;
    } else if (typeof source === 'string' && source.startsWith('data:')) {
      const base64Data = source.split(',')[1];
      if (!base64Data) throw new Error('Invalid Data URL format');
      dataBuffer = Buffer.from(base64Data, 'base64');
    } else if (typeof source === 'string' && source.startsWith('http')) {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      dataBuffer = Buffer.from(arrayBuffer);
    } else if (typeof source === 'string') {
      const fs = await import('fs');
      dataBuffer = fs.readFileSync(source);
    } else {
      throw new Error('Invalid source');
    }

    const result = await pdfParse(dataBuffer, {
      max: maxPages,
    });

    return result.text || '';
  } catch (error) {
    console.error('PDF text extraction failed:', error.message);
    return '';
  }
}
