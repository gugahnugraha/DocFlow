/**
 * Shared PDF thumbnail renderer — serializes renders through a single
 * PDFDocumentProxy per ArrayBuffer to avoid concurrent buffer-access races.
 */
import * as pdfjsLib from "pdfjs-dist";

// One render at a time per document
const renderQueue: (() => Promise<void>)[] = [];
let isRunning = false;

function enqueue(task: () => Promise<void>): void {
  renderQueue.push(task);
  if (!isRunning) drain();
}

async function drain(): Promise<void> {
  isRunning = true;
  while (renderQueue.length > 0) {
    const task = renderQueue.shift()!;
    try { await task(); } catch { /* swallow cancelled renders */ }
  }
  isRunning = false;
}

/**
 * Render a single PDF page to a canvas element.
 * Returns a cleanup function that cancels the render if still in progress.
 */
export function renderPage(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  canvas: HTMLCanvasElement,
  onDone: () => void,
  rotation = 0
): { cancel: () => void } {
  let cancelled = false;
  let renderTask: pdfjsLib.RenderTask | null = null;

  enqueue(async () => {
    if (cancelled) return;
    try {
      const page = await pdfDoc.getPage(pageNumber);
      if (cancelled) return;

      const vp = page.getViewport({ scale, rotation });
      canvas.width  = vp.width;
      canvas.height = vp.height;

      const ctx = canvas.getContext("2d");
      if (!ctx || cancelled) return;

      renderTask = page.render({ canvasContext: ctx, viewport: vp });
      await renderTask.promise;

      if (!cancelled) onDone();
    } catch {
      // render cancelled or page load failed — silently ignore
    }
  });

  return {
    cancel: () => {
      cancelled = true;
      renderTask?.cancel();
    },
  };
}

/**
 * Load a PDF from an ArrayBuffer, returning a PDFDocumentProxy.
 * Uses Uint8Array to avoid transferring the buffer.
 */
export async function loadPdf(ab: ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
  // Copy bytes into a Uint8Array so pdfjs doesn't transfer/detach the original buffer
  const data = new Uint8Array(ab.byteLength);
  data.set(new Uint8Array(ab));
  return pdfjsLib.getDocument({ data }).promise;
}
