"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Loader2, Stamp } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import Header from "@/components/Header";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const POSITIONS = [
  { id: "top-left",     label: "Kiri Atas" },
  { id: "top-center",   label: "Tengah Atas" },
  { id: "top-right",    label: "Kanan Atas" },
  { id: "center",       label: "Tengah" },
  { id: "diagonal",     label: "Diagonal" },
  { id: "bottom-left",  label: "Kiri Bawah" },
  { id: "bottom-center",label: "Tengah Bawah" },
  { id: "bottom-right", label: "Kanan Bawah" },
];

function PagePreview({
  file,
  pageNumber,
  watermarkText,
  color,
  opacity,
  fontSize,
  position,
  rotation,
}: {
  file: File;
  pageNumber: number;
  watermarkText: string;
  color: string;
  opacity: number;
  fontSize: number;
  position: string;
  rotation: number;
}) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Render PDF page
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
        const ctx = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
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

  // Draw watermark overlay
  useEffect(() => {
    if (!overlayCanvasRef.current || dims.w === 0 || !watermarkText) return;
    const canvas = overlayCanvasRef.current;
    canvas.width = dims.w;
    canvas.height = dims.h;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, dims.w, dims.h);

    const scaledFontSize = Math.round(fontSize * (dims.w / 595));
    ctx.font = `bold ${scaledFontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;

    const metrics = ctx.measureText(watermarkText);
    const tw = metrics.width;
    const th = scaledFontSize;

    let x = 0, y = 0;
    switch (position) {
      case "center":       x = (dims.w - tw) / 2; y = (dims.h + th) / 2; break;
      case "top-left":     x = 20; y = th + 20; break;
      case "top-center":   x = (dims.w - tw) / 2; y = th + 20; break;
      case "top-right":    x = dims.w - tw - 20; y = th + 20; break;
      case "bottom-left":  x = 20; y = dims.h - 20; break;
      case "bottom-center":x = (dims.w - tw) / 2; y = dims.h - 20; break;
      case "bottom-right": x = dims.w - tw - 20; y = dims.h - 20; break;
      case "diagonal":
        ctx.save();
        ctx.translate(dims.w / 2, dims.h / 2);
        ctx.rotate((-rotation * Math.PI) / 180);
        ctx.fillText(watermarkText, -tw / 2, th / 2);
        ctx.restore();
        ctx.globalAlpha = 1;
        return;
    }
    ctx.fillText(watermarkText, x, y);
    ctx.globalAlpha = 1;
  }, [dims, watermarkText, color, opacity, fontSize, position, rotation]);

  return (
    <div className="relative inline-block shadow-lg rounded-lg overflow-hidden bg-white">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        </div>
      )}
      <canvas ref={pdfCanvasRef} className="block" />
      <canvas ref={overlayCanvasRef} className="absolute top-0 left-0 pointer-events-none" />
    </div>
  );
}

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Watermark settings
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#FF0000");
  const [opacity, setOpacity] = useState(0.3);
  const [position, setPosition] = useState("diagonal");
  const [rotation, setRotation] = useState(45);
  const [applyTo, setApplyTo] = useState<"all" | "odd" | "even">("all");

  const loadFile = useCallback(async (f: File) => {
    setFile(f);
    const ab = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    setTotalPages(pdf.numPages);
    pdf.destroy();
    setCurrentPreviewPage(1);
  }, []);

  const handleWatermark = async () => {
    if (!file || !watermarkText.trim()) return;
    setIsProcessing(true);
    try {
      let pageIndices: number[] | "all" = "all";
      if (applyTo === "odd") {
        pageIndices = Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 0);
      } else if (applyTo === "even") {
        pageIndices = Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 1);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("text", watermarkText);
      formData.append("fontSize", fontSize.toString());
      formData.append("opacity", opacity.toString());
      formData.append("rotation", rotation.toString());
      formData.append("color", color);
      formData.append("position", position);
      formData.append("pages", pageIndices === "all" ? "all" : JSON.stringify(pageIndices));

      const res = await fetch("/api/watermark", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Gagal");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "watermarked.pdf";
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
      <Header activePath="/watermark" />

      <main className="flex min-h-[calc(100vh-4rem)]">
        {!file ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-10 shadow-sm max-w-md w-full text-center">
              <div className="bg-indigo-50 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Stamp className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Watermark PDF</h2>
              <p className="text-slate-500 mb-8">Tambahkan teks watermark pada setiap halaman PDF Anda</p>
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
            {/* Preview Area */}
            <div className="flex-1 overflow-auto p-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setCurrentPreviewPage(p => Math.max(1, p - 1))}
                  disabled={currentPreviewPage <= 1}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-slate-50"
                >
                  ← Prev
                </button>
                <span className="text-sm text-slate-600 font-medium">Halaman {currentPreviewPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPreviewPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPreviewPage >= totalPages}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-slate-50"
                >
                  Next →
                </button>
              </div>
              <PagePreview
                file={file}
                pageNumber={currentPreviewPage}
                watermarkText={watermarkText}
                color={color}
                opacity={opacity}
                fontSize={fontSize}
                position={position}
                rotation={rotation}
              />
            </div>

            {/* Settings Panel */}
            <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Watermark PDF</h2>

              <div className="space-y-5 flex-1">
                {/* Watermark Text */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teks Watermark</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Contoh: CONFIDENTIAL"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Ukuran Font: <span className="text-red-600">{fontSize}px</span>
                  </label>
                  <input type="range" min={12} max={120} value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-red-600" />
                </div>

                {/* Color + Opacity row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Warna</label>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Opacity: <span className="text-red-600">{Math.round(opacity * 100)}%</span>
                    </label>
                    <input type="range" min={5} max={100} value={Math.round(opacity * 100)}
                      onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
                      className="w-full accent-red-600 mt-1" />
                  </div>
                </div>

                {/* Position Grid */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Posisi</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {POSITIONS.map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => setPosition(pos.id)}
                        className={`py-2 px-1 text-xs font-medium rounded-lg border-2 transition-all ${
                          position === pos.id
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rotation (only for diagonal) */}
                {position === "diagonal" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Rotasi: <span className="text-red-600">{rotation}°</span>
                    </label>
                    <input type="range" min={0} max={90} value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full accent-red-600" />
                  </div>
                )}

                {/* Apply to */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Terapkan ke</label>
                  <div className="flex gap-2">
                    {(["all", "odd", "even"] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setApplyTo(v)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                          applyTo === v
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {v === "all" ? "Semua" : v === "odd" ? "Ganjil" : "Genap"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleWatermark}
                disabled={isProcessing || !watermarkText.trim()}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg mt-6"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                ) : (
                  <><Stamp className="w-5 h-5" /> Tambah Watermark</>
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
