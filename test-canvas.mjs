import { createCanvas } from '@napi-rs/canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Test canvas
const c = createCanvas(100, 100);
const ctx = c.getContext('2d');
ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, 100, 100);
ctx.fillStyle = '#e64809';
ctx.fillRect(20, 20, 60, 60);
const buf = await c.encode('jpeg', 90);
console.log('✓ canvas encode works, bytes:', buf.length);

// Test pdfjs in Node
pdfjsLib.GlobalWorkerOptions.workerSrc = '';
console.log('✓ pdfjs loaded, getDocument type:', typeof pdfjsLib.getDocument);
console.log('ALL DEPS OK');
