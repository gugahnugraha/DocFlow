"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Must be set once at module level in the browser
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

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
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const renderRef    = useRef<pdfjsLib.RenderTask | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pdfDoc) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        renderRef.current?.cancel();

        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const vp = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        canvas.width  = vp.width;
        canvas.height = vp.height;

        const ctx = canvas.getContext("2d");
        if (!ctx || cancelled) return;

        // Fill white background to handle transparent PDFs
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        renderRef.current = page.render({ canvasContext: ctx, viewport: vp });
        await renderRef.current.promise;

        if (!cancelled) setLoading(false);
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException" && !cancelled) {
          console.warn("PdfThumb render error:", err?.message);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      renderRef.current?.cancel();
    };
  }, [pdfDoc, pageNumber, scale, rotation]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-50">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
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
