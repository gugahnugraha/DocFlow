"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Loader2, Hash } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import Header from "@/components/Header";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const POSITIONS = [
  { id: "top-left",      label: "Kiri Atas",    col: 1, row: 1 },
  { id: "top-center",    label: "Tengah Atas",  col: 2, row: 1 },
  { id: "top-right",     label: "Kanan Atas",   col: 3, row: 1 },
  { id: "bottom-left",   label: "Kiri Bawah",   col: 1, row: 2 },
  { id: "bottom-center", label: "Tengah Bawah", col: 2, row: 2 },
  { id: "bottom-right",  label: "Kanan Bawah",  col: 3, row: 2 },
];

const FORMAT_PRESETS = [
  { id: "{n}",            label: "1, 2, 3 …" },
  { id: "Page {n}",       label: "Page 1, Page 2 …" },
  { id: "{n} / {total}",  label: "1 / 10, 2 / 10 …" },
  { id: "- {n} -",        label: "- 1 -, - 2 - …" },
];

function PagePreview({
  file,
  pageNumber,
  totalPages,
  format,
  fontSize,
  color,
  position,
  startNumber,
  skipFirstPage,
  marginX,
  marginY,
}: {
  file: File;
  pageNumber: number;
  totalPages: number;
  format: string;
  fontSize: number;
  color: string;
  position: string;
  startNumber: number;
  skipFirstPage: boolean;
  marginX: number;
  marginY: number;
}) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
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
        const scale = 1.2;
        const viewport = page.getViewport({ scale });
        const canvas = pdfCanvasRef.current;
        if (!canvas) { pdf.destroy(); return; }
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
        if (!cancelled) {
          setDims({ w: viewport.width, h: viewport.height });
          setIsLoading(false);
        }
        pdf.destroy();
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [file, pageNumber]);

  // Draw number overlay
  useEffect(() => {
    if (!overlayRef.current || dims.w === 0) return;
    const canvas = overlayRef.current;
    canvas.width = dims.w;
    canvas.height = dims.h;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, dims.w, dims.h);

    if (skipFirstPage && pageNumber === 1) return;

    const displayNumber = pageNumber + startNumber - 1;
    const text = format
      .replace("{n}", String(displayNumber))
      .replace("{total}", String(totalPages));

    // Scale margins proportionally (PDF assumed 595pt wide)
    const scale = dims.w / 595;
    const scaledFontSize = Math.round(fontSize * scale);
    const scaledMarginX = marginX * scale;
    const scaledMarginY = marginY * scale;

    ctx.font = `${scaledFontSize}px Arial`;
    ctx.fillStyle = color;

    const tw = ctx.measureText(text).width;
    const th = scaledFontSize;

    let x = 0, y = 0;
    switch (position) {
      case "top-left":      x = scaledMarginX;              y = scaledMarginY + th; break;
      case "top-center":    x = (dims.w - tw) / 2;          y = scaledMarginY + th; break;
      case "top-right":     x = dims.w - tw - scaledMarginX;y = scaledMarginY + th; break;
      case "bottom-left":   x = scaledMarginX;              y = dims.h - scaledMarginY; break;
      case "bottom-center": x = (dims.w - tw) / 2;          y = dims.h - scaledMarginY; break;
      case "bottom-right":  x = dims.w - tw - scaledMarginX;y = dims.h - scaledMarginY; break;
    }

    ctx.fillText(text, x, y);
  }, [dims, format, fontSize, color, position, startNumber, skipFirstPage, pageNumber, totalPages, marginX, marginY]);

  return (
    <div className="relative inline-block shadow-lg rounded overflow-hidden bg-white">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        </div>
      )}
      <canvas ref={pdfCanvasRef} className="block" />
      <canvas ref={overlayRef} className="absolute top-0 left-0 pointer-events-none" />
    </div>
  );
}

export default function PageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings
  const [format, setFormat] = useState("{n}");
  const [customFormat, setCustomFormat] = useState("{n}");
  const [useCustomFormat, setUseCustomFormat] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [color, setColor] = useState("#000000");
  const [position, setPosition] = useState("bottom-center");
  const [startNumber, setStartNumber] = useState(1);
  const [skipFirstPage, setSkipFirstPage] = useState(false);
  const [marginX, setMarginX] = useState(40);
  const [marginY, setMarginY] = useState(24);

  const activeFormat = useCustomFormat ? customFormat : format;

  const loadFile = useCallback(async (f: File) => {
    setFile(f);
    const ab = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    setTotalPages(pdf.numPages);
    pdf.destroy();
    setCurrentPreviewPage(1);
  }, []);

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("position", position);
      formData.append("format", activeFormat);
      formData.append("fontSize", fontSize.toString());
      formData.append("color", color);
      formData.append("startNumber", startNumber.toString());
      formData.append("marginX", marginX.toString());
      formData.append("marginY", marginY.toString());
      formData.append("skipFirstPage", skipFirstPage.toString());

      const res = await fetch("/api/page-numbers", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Gagal");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "numbered.pdf";
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
      <Header activePath="/page-numbers" />

      <main className="flex min-h-[calc(100vh-4rem)]">
        {!file ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-10 shadow-sm max-w-md w-full text-center">
              <div className="bg-teal-50 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Hash className="w-10 h-10 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Nomor Halaman PDF</h2>
              <p className="text-slate-500 mb-8">Tambahkan nomor halaman ke dokumen PDF dengan posisi dan format kustom</p>
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
            {/* Preview */}
            <div className="flex-1 overflow-auto p-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setCurrentPreviewPage(p => Math.max(1, p - 1))} disabled={currentPreviewPage <= 1}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-slate-50">
                  ← Prev
                </button>
                <span className="text-sm text-slate-600 font-medium">Halaman {currentPreviewPage} / {totalPages}</span>
                <button onClick={() => setCurrentPreviewPage(p => Math.min(totalPages, p + 1))} disabled={currentPreviewPage >= totalPages}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-slate-50">
                  Next →
                </button>
              </div>
              <PagePreview
                file={file}
                pageNumber={currentPreviewPage}
                totalPages={totalPages}
                format={activeFormat}
                fontSize={fontSize}
                color={color}
                position={position}
                startNumber={startNumber}
                skipFirstPage={skipFirstPage}
                marginX={marginX}
                marginY={marginY}
              />
            </div>

            {/* Settings */}
            <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Nomor Halaman</h2>

              <div className="space-y-5 flex-1">
                {/* Position grid */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Posisi</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {POSITIONS.map((pos) => (
                      <button key={pos.id} onClick={() => setPosition(pos.id)}
                        className={`py-2 px-1 text-xs font-medium rounded-lg border-2 transition-all ${
                          position === pos.id
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}>
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format presets */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Format</label>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {FORMAT_PRESETS.map((f) => (
                      <button key={f.id}
                        onClick={() => { setFormat(f.id); setUseCustomFormat(false); }}
                        className={`py-2 px-2 text-xs font-medium rounded-lg border-2 transition-all ${
                          !useCustomFormat && format === f.id
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5 cursor-pointer">
                      <input type="checkbox" checked={useCustomFormat} onChange={(e) => setUseCustomFormat(e.target.checked)} className="rounded" />
                      Format kustom
                    </label>
                    {useCustomFormat && (
                      <input type="text" value={customFormat} onChange={(e) => setCustomFormat(e.target.value)}
                        placeholder="cth: Hal. {n} dari {total}"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-red-400" />
                    )}
                    <p className="text-xs text-slate-400 mt-1">Gunakan {"{n}"} untuk nomor halaman, {"{total}"} untuk total halaman</p>
                  </div>
                </div>

                {/* Font size + color */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Ukuran: <span className="text-red-600">{fontSize}px</span>
                    </label>
                    <input type="range" min={8} max={32} value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-red-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warna</label>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer" />
                  </div>
                </div>

                {/* Start number */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mulai dari nomor</label>
                  <input type="number" min={0} value={startNumber}
                    onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-red-400" />
                </div>

                {/* Margins */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Margin X: <span className="text-red-600">{marginX}</span>
                    </label>
                    <input type="range" min={10} max={100} value={marginX}
                      onChange={(e) => setMarginX(parseInt(e.target.value))}
                      className="w-full accent-red-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Margin Y: <span className="text-red-600">{marginY}</span>
                    </label>
                    <input type="range" min={10} max={80} value={marginY}
                      onChange={(e) => setMarginY(parseInt(e.target.value))}
                      className="w-full accent-red-600" />
                  </div>
                </div>

                {/* Skip first page */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={skipFirstPage} onChange={(e) => setSkipFirstPage(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300" />
                  <span className="text-sm font-medium text-slate-700">Lewati halaman pertama (cover)</span>
                </label>
              </div>

              <button
                onClick={handleApply}
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg mt-6"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                ) : (
                  <><Hash className="w-5 h-5" /> Tambah Nomor Halaman</>
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
