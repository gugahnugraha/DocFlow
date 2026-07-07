"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Loader2, GripVertical, RotateCcw, ArrowDownUp } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import Header from "@/components/Header";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PageItem {
  /** 0-based original index in the source PDF */
  originalIndex: number;
  /** 1-based display number for the original page */
  originalNumber: number;
  /** unique key for React reconciliation */
  key: string;
}

function PageThumb({
  file,
  pageNumber,
  label,
  isDragging,
  isDragOver,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: {
  file: File;
  pageNumber: number;
  label: string;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const ab = await file.arrayBuffer();
        if (cancelled) return;
        const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
        if (cancelled) { pdf.destroy(); return; }
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 0.65 });
        const canvas = canvasRef.current;
        if (!canvas) { pdf.destroy(); return; }
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
        if (!cancelled) setIsLoading(false);
        pdf.destroy();
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [file, pageNumber]);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`flex flex-col items-center gap-2 select-none transition-all ${
        isDragging ? "opacity-40 scale-95" : isDragOver ? "scale-105" : ""
      }`}
    >
      <div className={`relative bg-white rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing shadow-sm ${
        isDragOver ? "border-red-500 ring-2 ring-red-200 shadow-md" : "border-slate-200 hover:border-slate-300"
      }`}>
        {/* Drag handle */}
        <div className="absolute top-1 left-1 z-10 text-slate-400 hover:text-slate-600">
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex items-center justify-center min-w-[100px] min-h-[130px] p-2 pt-5">
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          ) : (
            <canvas ref={canvasRef} className="max-w-full h-auto" />
          )}
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}

export default function ReorderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const loadFile = useCallback(async (f: File) => {
    setFile(f);
    const ab = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    const count = pdf.numPages;
    pdf.destroy();
    setPages(
      Array.from({ length: count }, (_, i) => ({
        originalIndex: i,
        originalNumber: i + 1,
        key: `page-${i}`,
      }))
    );
  }, []);

  const handleDrop = (dropIndex: number) => {
    if (dragSourceIndex === null || dragSourceIndex === dropIndex) return;
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragSourceIndex, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    setDragSourceIndex(null);
    setDragOverIndex(null);
  };

  const resetOrder = () => {
    setPages((prev) =>
      [...prev].sort((a, b) => a.originalIndex - b.originalIndex)
    );
  };

  const reverseOrder = () => {
    setPages((prev) => [...prev].reverse());
  };

  const isOriginalOrder = pages.every((p, i) => p.originalIndex === i);

  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const order = pages.map((p) => p.originalIndex);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("order", JSON.stringify(order));

      const res = await fetch("/api/reorder", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Gagal");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reordered.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal memproses file");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header activePath="/reorder" />

      <main className="flex min-h-[calc(100vh-4rem)]">
        {!file ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-10 shadow-sm max-w-md w-full text-center">
              <div className="bg-violet-50 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <ArrowDownUp className="w-10 h-10 text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Susun Ulang Halaman PDF</h2>
              <p className="text-slate-500 mb-8">Drag & drop untuk mengatur ulang urutan halaman PDF</p>
              <label className="cursor-pointer">
                <input type="file" accept="application/pdf" onChange={(e) => e.target.files && loadFile(e.target.files[0])} className="hidden" />
                <div className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3">
                  <Upload className="w-6 h-6" /> Pilih File PDF
                </div>
              </label>
            </div>
          </div>
        ) : (
          <>
            {/* Main drag area */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Toolbar */}
              <div className="flex items-center gap-3 mb-6 bg-white rounded-xl p-3 shadow-sm">
                <span className="text-sm font-semibold text-slate-700">{pages.length} halaman</span>
                <div className="w-px h-5 bg-slate-200" />
                <button
                  onClick={reverseOrder}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ArrowDownUp className="w-4 h-4" /> Balik Urutan
                </button>
                {!isOriginalOrder && (
                  <button
                    onClick={resetOrder}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-500"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                )}
                {!isOriginalOrder && (
                  <span className="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                    Urutan diubah
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-5">
                {pages.map((page, index) => (
                  <PageThumb
                    key={page.key}
                    file={file}
                    pageNumber={page.originalNumber}
                    label={`${index + 1}`}
                    isDragging={dragSourceIndex === index}
                    isDragOver={dragOverIndex === index}
                    onDragStart={() => setDragSourceIndex(index)}
                    onDragEnter={() => setDragOverIndex(index)}
                    onDragEnd={() => { setDragSourceIndex(null); setDragOverIndex(null); }}
                    onDrop={() => handleDrop(index)}
                  />
                ))}
              </div>

              <p className="text-center text-sm text-slate-400 mt-8">
                Seret halaman untuk mengubah urutannya. Nomor di bawah tiap halaman adalah posisi baru.
              </p>
            </div>

            {/* Sidebar */}
            <div className="w-72 bg-white border-l border-slate-200 p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">Susun Halaman</h2>
              <p className="text-sm text-slate-500 text-center mb-6">Drag & drop halaman untuk mengubah urutan</p>

              <div className="flex-1 space-y-3">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-1">File</p>
                  <p className="text-sm text-slate-500 truncate">{file.name}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-1">Total Halaman</p>
                  <p className="text-sm text-slate-500">{pages.length} halaman</p>
                </div>

                {/* Current order preview */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Urutan Saat Ini</p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {pages.map((p) => p.originalNumber).join(" → ")}
                  </p>
                </div>

                {!isOriginalOrder && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                      Urutan berbeda dari dokumen asli. Klik <span className="font-semibold">Simpan</span> untuk mengunduh.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={isProcessing || isOriginalOrder}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg mt-6"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                ) : (
                  <><ArrowDownUp className="w-5 h-5" /> Simpan PDF</>
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
