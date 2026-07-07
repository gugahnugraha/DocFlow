"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfPreviewProps {
  file: File;
  pageNumber: number;
  onPageLoad?: (url: string) => void;
  className?: string;
}

export default function PdfPreview({ file, pageNumber, onPageLoad, className = "" }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const renderPage = async () => {
      if (!file || !canvasRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        if (!isSubscribed) return;

        const page = await pdf.getPage(pageNumber);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not get canvas context");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;
        
        if (onPageLoad) {
          const url = canvas.toDataURL("image/png");
          onPageLoad(url);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Gagal memuat preview PDF");
        setIsLoading(false);
      }
    };

    renderPage();

    return () => {
      isSubscribed = false;
    };
  }, [file, pageNumber, onPageLoad]);

  return (
    <div className={`${className} relative`}>
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <div className="relative bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
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
