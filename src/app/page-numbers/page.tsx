"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Hash } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";
import ProtectedRoute from "@/components/ProtectedRoute";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const POSITIONS = [
  { id: "top-left", label: "Kiri Atas" }, { id: "top-center", label: "Tengah Atas" }, { id: "top-right", label: "Kanan Atas" },
  { id: "bottom-left", label: "Kiri Bawah" }, { id: "bottom-center", label: "Tengah Bawah" }, { id: "bottom-right", label: "Kanan Bawah" },
];
const FORMAT_PRESETS = [
  { id: "{n}", label: "1, 2, 3 …" }, { id: "Page {n}", label: "Page 1, Page 2 …" },
  { id: "{n} / {total}", label: "1 / 10 …" }, { id: "- {n} -", label: "- 1 -, - 2 - …" },
];

function Preview({ file, pageNumber, totalPages, format, fontSize, color, position, startNumber, skipFirst, marginX, marginY }: any) {
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
        const page = await pdf.getPage(pageNumber);
        const vp = page.getViewport({ scale: 1.1 });
        const c = pdfRef.current!; c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext("2d")!, viewport: vp }).promise;
        if (alive) { setDims({ w: vp.width, h: vp.height }); setLoading(false); }
        pdf.destroy();
      } catch { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [file, pageNumber]);

  useEffect(() => {
    if (!ovRef.current || dims.w === 0) return;
    const c = ovRef.current; c.width = dims.w; c.height = dims.h;
    const ctx = c.getContext("2d")!; ctx.clearRect(0, 0, dims.w, dims.h);
    if (skipFirst && pageNumber === 1) return;
    const sf = dims.w / 595;
    const sfSize = Math.round(fontSize * sf);
    const sfMX = marginX * sf, sfMY = marginY * sf;
    ctx.font = `${sfSize}px Inter, sans-serif`; ctx.fillStyle = color;
    const displayN = pageNumber + startNumber - 1;
    const txt = format.replace("{n}", String(displayN)).replace("{total}", String(totalPages));
    const tw = ctx.measureText(txt).width;
    let x = 0, y = 0;
    if (position === "top-left")      { x = sfMX;                  y = sfMY + sfSize; }
    else if (position === "top-center")    { x = (dims.w - tw) / 2;     y = sfMY + sfSize; }
    else if (position === "top-right")     { x = dims.w - tw - sfMX;    y = sfMY + sfSize; }
    else if (position === "bottom-left")   { x = sfMX;                  y = dims.h - sfMY; }
    else if (position === "bottom-center") { x = (dims.w - tw) / 2;     y = dims.h - sfMY; }
    else if (position === "bottom-right")  { x = dims.w - tw - sfMX;    y = dims.h - sfMY; }
    ctx.fillText(txt, x, y);
  }, [dims, format, fontSize, color, position, startNumber, skipFirst, pageNumber, totalPages, marginX, marginY]);

  return (
    <div className="relative inline-block shadow-[var(--shadow-lg)] rounded-lg overflow-hidden bg-white">
      {loading && <div className="w-64 h-80 flex items-center justify-center"><div className="w-6 h-6 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" /></div>}
      <canvas ref={pdfRef} style={{ display: loading ? "none" : "block" }} />
      <canvas ref={ovRef} className="absolute top-0 left-0 pointer-events-none" />
    </div>
  );
}

export default function PageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [previewPage, setPreviewPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [format, setFormat] = useState("{n}");
  const [customFormat, setCustomFormat] = useState("{n}");
  const [useCustom, setUseCustom] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [color, setColor] = useState("#000000");
  const [position, setPosition] = useState("bottom-center");
  const [startNumber, setStartNumber] = useState(1);
  const [skipFirst, setSkipFirst] = useState(false);
  const [marginX, setMarginX] = useState(40);
  const [marginY, setMarginY] = useState(24);

  const activeFormat = useCustom ? customFormat : format;

  const loadFile = useCallback(async (files: File[]) => {
    const f = files[0]; setFile(f);
    const ab = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    setTotalPages(pdf.numPages); pdf.destroy(); setPreviewPage(1);
  }, []);

  const handleApply = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("position", position); fd.append("format", activeFormat);
      fd.append("fontSize", String(fontSize)); fd.append("color", color);
      fd.append("startNumber", String(startNumber)); fd.append("marginX", String(marginX));
      fd.append("marginY", String(marginY)); fd.append("skipFirstPage", String(skipFirst));
      const res = await fetch("/api/page-numbers", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "numbered.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Gagal memproses file"); }
    finally { setProcessing(false); }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Header activePath="/page-numbers" />
        <main className="flex min-h-[calc(100vh-60px)]">
          {!file ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-lg">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Hash className="w-8 h-8 text-brand-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Nomor Halaman PDF</h1>
                  <p className="text-sm text-[var(--text-muted)]">Tambahkan nomor halaman dengan posisi dan format kustom</p>
                </div>
                <DropZone onFiles={loadFile} accept="application/pdf" />
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[
                    { icon: <Hash className="w-4 h-4" />, label: "Pilih File" },
                    { icon: <Hash className="w-4 h-4" />, label: "Posisi" },
                    { icon: <Hash className="w-4 h-4" />, label: "Format" },
                    { icon: <Hash className="w-4 h-4" />, label: "Terapkan" },
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
                <Preview file={file} pageNumber={previewPage} totalPages={totalPages} format={activeFormat}
                  fontSize={fontSize} color={color} position={position} startNumber={startNumber}
                  skipFirst={skipFirst} marginX={marginX} marginY={marginY} />
              </div>
              <div className="sidebar">
                <div className="sidebar-header"><h2 className="font-bold text-[var(--text)] text-lg">Nomor Halaman</h2></div>
                <div className="sidebar-body">
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
                  <div>
                    <label className="label">Format</label>
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      {FORMAT_PRESETS.map(f => (
                        <button key={f.id} onClick={() => { setFormat(f.id); setUseCustom(false); }}
                          className={`py-1.5 text-[11px] font-semibold rounded-lg border-2 transition-all ${!useCustom && format === f.id ? "border-brand-500 bg-brand-50 text-brand-600" : "border-[var(--border)] text-[var(--text-muted)] hover:border-brand-200"}`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 text-xs mb-1 cursor-pointer">
                      <input type="checkbox" checked={useCustom} onChange={e => setUseCustom(e.target.checked)} className="accent-brand-500" />
                      <span className="text-[var(--text-muted)]">Format kustom</span>
                    </label>
                    {useCustom && <input value={customFormat} onChange={e => setCustomFormat(e.target.value)} placeholder="cth: Hal. {n} dari {total}" className="input text-xs" />}
                    <p className="text-[10px] text-[var(--text-subtle)] mt-1">Gunakan {"{n}"} nomor halaman, {"{total}"} total halaman</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Ukuran: <span className="text-brand-500">{fontSize}px</span></label>
                      <input type="range" min={8} max={32} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full accent-brand-500" />
                    </div>
                    <div>
                      <label className="label">Warna</label>
                      <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-10 rounded-xl border border-[var(--border)] cursor-pointer" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Mulai dari nomor</label>
                    <input type="number" min={0} value={startNumber} onChange={e => setStartNumber(+e.target.value || 1)} className="input" />
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={skipFirst} onChange={e => setSkipFirst(e.target.checked)} className="w-4 h-4 accent-brand-500 rounded" />
                    <span className="text-sm text-[var(--text-muted)]">Lewati halaman pertama (cover)</span>
                  </label>
                </div>
                <div className="sidebar-footer space-y-2">
                  <Button onClick={handleApply} loading={processing} fullWidth size="lg" icon={<Hash className="w-5 h-5"/>}>
                    {processing ? "Memproses…" : "Tambah Nomor Halaman"}
                  </Button>
                  <Button onClick={() => setFile(null)} variant="ghost" fullWidth size="sm">Ganti file</Button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
