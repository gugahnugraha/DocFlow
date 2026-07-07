"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Loader2, ImageIcon, Download } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import Header from "@/components/Header";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PageItem {
  number: number;
  selected: boolean;
  previewUrl?: string;
}

function PageThumb({
  file,
  pageNumber,
  selected,
  onToggle,
}: {
  file: File;
  pageNumber: number;
  selected: boolean;
  onToggle: () => void;
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
        const viewport = page.getViewport({ scale: 0.7 });
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
      onClick={onToggle}
      className={`relative bg-white rounded-xl shadow-sm border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
        selected ? "border-red-500 ring-2 ring-red-100" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      {/* Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          selected ? "bg-red-500 border-red-500" : "bg-white border-slate-300"
        }`}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[120px] p-2 pt-6">
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
        ) : (
          <canvas ref={canvasRef} className="max-w-full h-auto" />
        )}
      </div>

      <div className="text-center py-2 border-t border-slate-100">
        <span className="text-xs font-medium text-slate-600">Halaman {pageNumber}</span>
      </div>
    </div>
  );
}

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [dpi, setDpi] = useState(150);

  const loadFile = useCallback(async (f: File) => {
    setFile(f);
    const ab = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    const count = pdf.numPages;
    pdf.destroy();
    setPages(Array.from({ length: count }, (_, i) => ({ number: i + 1, selected: true })));
  }, []);

  const togglePage = (num: number) => {
    setPages(prev => prev.map(p => p.number === num ? { ...p, selected: !p.selected } : p));
  };

  const selectAll = () => setPages(prev => prev.map(p => ({ ...p, selected: true })));
  const deselectAll = () => setPages(prev => prev.map(p => ({ ...p, selected: false })));
  const allSelected = pages.every(p => p.selected);
  const selectedCount = pages.filter(p => p.selected).length;

  const handleConvert = async () => {
    if (!file || selectedCount === 0) return;
    setIsProcessing(true);
    try {
      const selectedPages = pages.filter(p => p.selected).map(p => p.number);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);
      formData.append("dpi", dpi.toString());
      formData.append("pages", JSON.stringify(selectedPages));

      const res = await fetch("/api/pdf-to-image", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Gagal");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const isZip = blob.type === "application/zip" || selectedPages.length > 1;
      a.download = isZip ? "pdf_images.zip" : `page_${selectedPages[0]}.${format}`;
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-black">Doc</span><span className="text-red-600">Flow</span>
          </a>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-slate-700 font-semibold hover:text-slate-900">Login</button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors">Sign up</button>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-4rem)]">
        {!file ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-10 shadow-sm max-w-md w-full text-center">
              <div className="bg-pink-50 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-10 h-10 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">PDF ke Gambar</h2>
              <p className="text-slate-500 mb-8">Konversi halaman PDF menjadi gambar JPG atau PNG berkualitas tinggi</p>
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
            {/* Page grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Toolbar */}
              <div className="flex items-center gap-3 mb-6 bg-white rounded-xl p-3 shadow-sm">
                <button onClick={allSelected ? deselectAll : selectAll}
                  className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  {allSelected ? "Hapus semua pilihan" : "Pilih semua"}
                </button>
                <span className="text-sm text-slate-500">{selectedCount} dari {pages.length} halaman dipilih</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                {pages.map((page) => (
                  <PageThumb
                    key={page.number}
                    file={file}
                    pageNumber={page.number}
                    selected={page.selected}
                    onToggle={() => togglePage(page.number)}
                  />
                ))}
              </div>
            </div>

            {/* Settings sidebar */}
            <div className="w-72 bg-white border-l border-slate-200 p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">PDF ke Gambar</h2>

              <div className="space-y-5 flex-1">
                {/* Format */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Format Output</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["jpg", "png"] as const).map((f) => (
                      <button key={f} onClick={() => setFormat(f)}
                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all uppercase ${
                          format === f
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}>
                        {f}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {format === "jpg" ? "Lebih kecil, cocok untuk foto" : "Lossless, cocok untuk teks/grafis"}
                  </p>
                </div>

                {/* DPI */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Kualitas (DPI): <span className="text-red-600">{dpi}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {[72, 150, 300].map((v) => (
                      <button key={v} onClick={() => setDpi(v)}
                        className={`py-2 text-sm font-semibold rounded-lg border-2 transition-all ${
                          dpi === v
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}>
                        {v === 72 ? "Rendah" : v === 150 ? "Sedang" : "Tinggi"}
                        <div className="text-xs font-normal opacity-70">{v} DPI</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    {selectedCount > 1
                      ? `${selectedCount} halaman akan diunduh sebagai file ZIP`
                      : "1 halaman akan diunduh sebagai file gambar"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleConvert}
                disabled={isProcessing || selectedCount === 0}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg mt-6"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Mengkonversi...</>
                ) : (
                  <><Download className="w-5 h-5" /> Konversi ke {format.toUpperCase()}</>
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
