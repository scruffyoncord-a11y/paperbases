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
    let dataBuffer;
    if (Buffer.isBuffer(source)) {
      dataBuffer = source;
    } else if (typeof source === 'string' && source.startsWith('data:')) {
      // Handled later
    } else if (typeof source === 'string' && source.startsWith('http')) {
      const resp = await fetch(source);
      if (!resp.ok) throw new Error(`Failed to fetch PDF: ${resp.status}`);
      const arrayBuffer = await resp.arrayBuffer();
      dataBuffer = Buffer.from(arrayBuffer);
    } else if (typeof source === 'string') {
      const fs = await import('fs');
      dataBuffer = fs.readFileSync(source);
    }

    const OCR_API_URL = "https://v4b0ydi0x1dalby6.aistudio-app.com/layout-parsing";
    const OCR_TOKEN = process.env.OCR_API_TOKEN || "101b45aead046b960dfc4e4e83191812bccb7296";

    let base64String = "";
    if (typeof source === 'string' && source.startsWith('data:')) {
      base64String = source.split(',')[1];
    } else if (dataBuffer) {
      base64String = dataBuffer.toString('base64');
    }

    console.log(`[OCR] Sending to Layout Parsing API... (Size: ${Math.round(base64String.length/1024)} KB)`);

    const ocrResponse = await fetch(OCR_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `token ${OCR_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        file: base64String,
        fileType: source.toString().includes('pdf') || !source.toString().includes('image') ? 0 : 1,
        useDocOrientationClassify: false,
        useDocUnwarping: false,
        useChartRecognition: false
      })
    });

    if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text();
        throw new Error(`OCR API failed (${ocrResponse.status}): ${errorText}`);
    }

    const data = await ocrResponse.json();
    const results = data.result?.layoutParsingResults || [];
    
    let combinedMarkdown = "";
    for (const res of results) {
        combinedMarkdown += (res.markdown?.text || "") + " \n";
    }

    const resultText = combinedMarkdown.trim();
    console.log(`[OCR] Extraction successful. Characters: ${resultText.length}`);

    return resultText;
  } catch (error) {
    console.error('PDF OCR/Extraction failed:', error.message);
    return '';
  }
}
