import { createCanvas } from '@napi-rs/canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Find the worker path in node_modules
const __dirname = dirname(fileURLToPath(import.meta.url));
const workerPath = join(__dirname, 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');

// Option 1: point to the local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
console.log('Worker path set to:', workerPath);

// Create a test PDF in memory
const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([595, 842]);
page.drawText('Test PDF Page', { x: 50, y: 750, size: 30 });
const pdfBytes = await pdfDoc.save();

try {
  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(pdfBytes),
  }).promise;

  console.log('PDF loaded, pages:', pdf.numPages);

  const pdfPage = await pdf.getPage(1);
  const scale = 150 / 72;
  const viewport = pdfPage.getViewport({ scale });

  const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await pdfPage.render({ canvasContext: ctx, viewport }).promise;

  const buf = await canvas.encode('jpeg', 90);
  writeFileSync('test-output.jpg', buf);
  console.log('✓ Success! Image saved, bytes:', buf.length);
  pdf.destroy();
} catch(e) {
  console.error('ERROR:', e.message);
}
