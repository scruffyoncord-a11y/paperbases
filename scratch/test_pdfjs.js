import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function test() {
  try {
    const dataBuffer = Buffer.from("dummy", "utf-8"); // Obviously this will fail pdf parsing, but I just want to see if the import works.
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(dataBuffer) });
    const pdf = await loadingTask.promise;
    console.log("Pages:", pdf.numPages);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
