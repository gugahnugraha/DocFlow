"use client";

/**
 * PdfThumb — renders a single PDF page thumbnail.
 * Accepts a PDFDocumentProxy that is shared/pre-loaded by the parent
 * so we never call getDocument() concurrently for the same file.
 */
import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

interface PdfThumbProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  pageNumber: number;
  scale?: number;
  rotation?: number;
  className?: string;
}

export default function PdfThumb({
  pdfDoc,
  pageNumber,
  scale = 0.6,
  rotation = 0,
  className = "w-full h-auto",
}: PdfThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;

    const render = async () => {
      try {
        // Cancel any in-progress render
        renderTaskRef.current?.cancel();

        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const vp = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current!;
        canvas.width  = vp.width;
        canvas.height = vp.height;

        const ctx = canvas.getContext("2d");
        if (!ctx || cancelled) return;

        renderTaskRef.current = page.render({ canvasContext: ctx, viewport: vp });
        await renderTaskRef.current.promise;

        if (!cancelled) setLoading(false);
      } catch (err: any) {
        // "cancelled" error is expected — ignore it
        if (err?.name !== "RenderingCancelledException" && !cancelled) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    render();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [pdfDoc, pageNumber, scale, rotation]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={className}
        style={{ display: loading ? "none" : "block" }}
      />
    </div>
  );
}
