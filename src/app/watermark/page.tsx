"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Stamp } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const POSITIONS = [
  { id: "top-left", label: "Kiri Atas" }, { id: "top-center", label: "Tengah Atas" }, { id: "top-right", label: "Kanan Atas" },
  { id: "center", label: "Tengah" }, { id: "diagonal", label: "Diagonal" },
  { id: "bottom-left", label: "Kiri Bawah" }, { id: "bottom-center", label: "Tengah Bawah" }, { id: "bottom-right", label: "Kanan Bawah" },
];

function Preview({ file, pageNumber, text, color, opacity, fontSize, position, rotation }: {
  file: File; pageNumber: number; text: string; color: string; opacity: number;
  fontSize: number; position: string; rotation: number;
}) {
  const pdfRef = useRef<HTMLCanvasElement>(null);
  const ovRef  = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ab = await file.arrayBuffer();
        if (!alive) return;
        const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
        if (!alive) { pdf.destroy(); return; }
        const page = await pdf.getPage(pageNumber);
        const vp = page.getViewport({ scale: 1.1 });
        const c = pdfRef.current!;
        c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext("2d")!, viewport: vp }).promise;
        if (alive) { setDims({ w: vp.width, h: vp.height }); setLoading(false); }
        pdf.destroy();
      } catch { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [file, pageNumber]);

  useEffect(() => {
    if (!ovRef.current || dims.w === 0 || !text) return;
    const c = ovRef.current; c.width = dims.w; c.height = dims.h;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, dims.w, dims.h);
    const sf = dims.w / 595;
    ctx.font = `bold ${Math.round(fontSize * sf)}px Inter, sans-serif`;
    ctx.fillStyle = color; ctx.globalAlpha = opacity;
    const tw = ctx.measureText(text).width;
    const th = Math.round(fontSize * sf);
    if (position === "diagonal") {
      ctx.save(); ctx.translate(dims.w / 2, dims.h / 2); ctx.rotate((-rotation * Math.PI) / 180);
      ctx.fillText(text, -tw / 2, th / 2); ctx.restore();
    } else {
      const m = 20 * sf;
      let x = 0, y = 0;
      if (position === "center")        { x = (dims.w - tw) / 2; y = (dims.h + th) / 2; }
      else if (position === "top-left") { x = m; y = th + m; }
      else if (position === "top-center") { x = (dims.w - tw) / 2; y = th + m; }
      else if (position === "top-right")  { x = dims.w - tw - m; y = th + m; }
      else if (position === "bottom-left")   { x = m; y = dims.h - m; }
      else if (position === "bottom-center") { x = (dims.w - tw) / 2; y = dims.h - m; }
      else if (position === "bottom-right")  { x = dims.w - tw - m; y = dims.h - m; }
      ctx.fillText(text, x, y);
    }
    ctx.globalAlpha = 1;
  }, [dims, text, color, opacity, fontSize, position, rotation]);

  return (
    <div className="relative inline-block shadow-[var(--shadow-lg)] rounded-lg overflow-hidden bg-white">
      {loading && <div className="w-64 h-80 flex items-center justify-center"><div className="w-6 h-6 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" /></div>}
      <canvas ref={pdfRef} className="block" style={{ display: loading ? "none" : "block" }} />
      <canvas ref={ovRef} className="absolute top-0 left-0 pointer-events-none" />
    </div>
  );
}

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [previewPage, setPreviewPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#FF0000");
  const [opacity, setOpacity] = useState(0.3);
  const [position, setPosition] = useState("diagonal");
  const [rotation, setRotation] = useState(45);
  const [applyTo, setApplyTo] = useState<"all" | "odd" | "even">("all");

  const loadFile = useCallback(async (files: File[]) => {
    const f = files[0]; setFile(f);
    const ab = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    setTotalPages(pdf.numPages); pdf.destroy(); setPreviewPage(1);
  }, []);

  const handleApply = async () => {
    if (!file || !text.trim()) return;
    setProcessing(true);
    try {
      let pageIndices: number[] | "all" = "all";
      if (applyTo === "odd") pageIndices = Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 0);
      else if (applyTo === "even") pageIndices = Array.from({ length: totalPages }, (_, i) => i).filter(i => i % 2 === 1);
      const fd = new FormData();
      fd.append("file", file); fd.append("text", text); fd.append("fontSize", String(fontSize));
      fd.append("opacity", String(opacity)); fd.append("rotation", String(rotation));
      fd.append("color", color); fd.append("position", position);
      fd.append("pages", pageIndices === "all" ? "all" : JSON.stringify(pageIndices));
      const res = await fetch("/api/watermark", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "watermarked.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Gagal memproses file"); }
    finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Header activePath="/watermark" />
      <main className="flex min-h-[calc(100vh-60px)]">
        {!file ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Stamp className="w-8 h-8 text-brand-500" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Watermark PDF</h1>
                <p className="text-sm text-[var(--text-muted)]">Tambahkan teks watermark pada setiap halaman PDF</p>
              </div>
              <DropZone onFiles={loadFile} accept="application/pdf" />
              <div className="mt-5 grid grid-cols-4 gap-2">
                {[
                  { icon: <Stamp className="w-4 h-4" />, label: "Pilih File" },
                  { icon: <Stamp className="w-4 h-4" />, label: "Teks" },
                  { icon: <Stamp className="w-4 h-4" />, label: "Posisi" },
                  { icon: <Stamp className="w-4 h-4" />, label: "Terapkan" },
                ].map(f => (
                  <div key={f.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-[var(--border)] text-center">
                    <span className="text-brand-500">{f.icon}</span>
                    <span className="text-xs font-medium text-[var(--text-muted)]">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto p-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <Button onClick={() => setPreviewPage(p => Math.max(1, p - 1))} disabled={previewPage <= 1} variant="outline" size="sm">← Prev</Button>
                <span className="text-sm text-[var(--text-muted)] font-medium px-2">{previewPage} / {totalPages}</span>
                <Button onClick={() => setPreviewPage(p => Math.min(totalPages, p + 1))} disabled={previewPage >= totalPages} variant="outline" size="sm">Next →</Button>
              </div>
              <Preview file={file} pageNumber={previewPage} text={text} color={color} opacity={opacity} fontSize={fontSize} position={position} rotation={rotation} />
            </div>
            <div className="sidebar">
              <div className="sidebar-header"><h2 className="font-bold text-[var(--text)] text-lg">Watermark PDF</h2></div>
              <div className="sidebar-body">
                <div>
                  <label className="label">Teks Watermark</label>
                  <input value={text} onChange={e => setText(e.target.value)} placeholder="cth: CONFIDENTIAL" className="input" />
                </div>
                <div>
                  <label className="label">Ukuran Font: <span className="text-brand-500">{fontSize}px</span></label>
                  <input type="range" min={12} max={120} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full accent-brand-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Warna</label>
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-10 rounded-xl border border-[var(--border)] cursor-pointer" />
                  </div>
                  <div>
                    <label className="label">Opacity: <span className="text-brand-500">{Math.round(opacity * 100)}%</span></label>
                    <input type="range" min={5} max={100} value={Math.round(opacity * 100)} onChange={e => setOpacity(+e.target.value / 100)} className="w-full accent-brand-500 mt-2" />
                  </div>
                </div>
                <div>
                  <label className="label">Posisi</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {POSITIONS.map(p => (
                      <button key={p.id} onClick={() => setPosition(p.id)}
                        className={`py-1.5 px-1 text-[11px] font-semibold rounded-lg border-2 transition-all ${position === p.id ? "border-brand-500 bg-brand-50 text-brand-600" : "border-[var(--border)] text-[var(--text-muted)] hover:border-brand-200"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                {position === "diagonal" && (
                  <div>
                    <label className="label">Rotasi: <span className="text-brand-500">{rotation}°</span></label>
                    <input type="range" min={0} max={90} value={rotation} onChange={e => setRotation(+e.target.value)} className="w-full accent-brand-500" />
                  </div>
                )}
                <div>
                  <label className="label">Terapkan ke</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["all","odd","even"] as const).map(v => (
                      <button key={v} onClick={() => setApplyTo(v)}
                        className={`py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${applyTo === v ? "border-brand-500 bg-brand-50 text-brand-600" : "border-[var(--border)] text-[var(--text-muted)] hover:border-brand-200"}`}>
                        {v === "all" ? "Semua" : v === "odd" ? "Ganjil" : "Genap"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sidebar-footer space-y-2">
                <Button onClick={handleApply} loading={processing} disabled={!text.trim()} fullWidth size="lg" icon={<Stamp className="w-5 h-5"/>}>
                  {processing ? "Memproses…" : "Tambah Watermark"}
                </Button>
                <Button onClick={() => setFile(null)} variant="ghost" fullWidth size="sm">Ganti file</Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
