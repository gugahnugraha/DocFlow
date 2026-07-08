"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Setup worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewProps {
  file: File;
  pageNumber: number;
  onPageLoad?: (url: string) => void;
  className?: string;
}

export default function PdfPreview({ file, pageNumber, onPageLoad, className = "" }: PdfPreviewProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;

    const renderPage = async () => {
      if (!file || !canvasRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Baca file sekali dan simpan reference
        if (!pdfDoc) {
          const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
          });
          pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        }

        if (!isSubscribed || !pdfDoc) return;

        const page = await pdfDoc.getPage(pageNumber);
        if (!isSubscribed) return;

        // Kurangi scale untuk performance
        const scale = 0.75;
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not get canvas context");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Simpan task render untuk bisa di-cancel
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        
        if (onPageLoad && isSubscribed) {
          const url = canvas.toDataURL("image/png");
          onPageLoad(url);
        }
        
        if (isSubscribed) {
          setIsLoading(false);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "RenderingCancelledException" && isSubscribed) {
          console.error("Error loading PDF:", err);
          setError(t.components.pdfPreview.error);
          setIsLoading(false);
        }
      }
    };

    renderPage();

    return () => {
      isSubscribed = false;
      // Cancel ongoing render
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      // Cleanup PDF document
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [file, pageNumber, onPageLoad, t]);

  return (
    <div className={`${className} relative`}>
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="relative bg-white/60 backdrop-blur-xl rounded-xl shadow-[0_16px_40px_-28px_rgba(15,23,42,0.5)] border border-white/35 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-xl z-10">
            <div className="w-5 h-5 border-3 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
          style={{ display: isLoading ? "none" : "block" }}
        />
      </div>
    </div>
  );
}
