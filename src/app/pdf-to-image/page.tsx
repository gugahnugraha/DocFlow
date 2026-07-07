"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImageIcon, Download } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const copyAB = (b: ArrayBuffer): ArrayBuffer => b.slice(0);

function PageThumb({ arrayBuffer, pageNumber, selected, onToggle }: {
  arrayBuffer: ArrayBuffer | null; pageNumber: number; selected: boolean; onToggle: () => void;
}) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!arrayBuffer) return;
    let alive = true;
    (async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: copyAB(arrayBuffer) }).promise;
        if (!alive) { pdf.destroy(); return; }
        const page = await pdf.getPage(pageNumber);
        const vp = page.getViewport({ scale: 0.65 });
        const c = cvs.current!; c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext("2d")!, viewport: vp }).promise;
        if (alive) setLoading(false); pdf.destroy();
      } catch { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [arrayBuffer, pageNumber]);

  return (
    <div onClick={onToggle}
      className={`relative bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-sm ${
        selected ? "border-brand-500 shadow-[0_0_0_3px_rgba(230,72,9,.12)]" : "border-[var(--border)] hover:border-brand-200"
      }`}>
      <div className={`absolute top-2 left-2 z-10 w-4 h-4 rounded border-2 flex items-center justify-center ${
        selected ? "bg-brand-500 border-brand-500" : "bg-white border-slate-300"
      }`}>
        {selected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
      </div>
      <div className="flex items-center justify-center min-h-[100px] p-2 pt-6">
        {loading ? <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" /> : <canvas ref={cvs} className="max-w-full h-auto" />}
      </div>
      <div className="text-center py-1.5 border-t border-[var(--border)]">
        <span className="text-[11px] font-semibold text-[var(--text-subtle)]">{pageNumber}</span>
      </div>
    </div>
  );
}

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileAB, setFileAB] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<{ number: number; selected: boolean }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [dpi, setDpi] = useState(150);

  const loadFile = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    const ab = await f.arrayBuffer();
    setFileAB(ab);
    const pdf = await pdfjsLib.getDocument({ data: ab.slice(0) }).promise;
    setPages(Array.from({ length: pdf.numPages }, (_, i) => ({ number: i + 1, selected: true })));
    pdf.destroy();
  }, []);

  const toggle = (n: number) => setPages(p => p.map(pg => pg.number === n ? { ...pg, selected: !pg.selected } : pg));
  const allSelected = pages.every(p => p.selected);
  const selectedCount = pages.filter(p => p.selected).length;

  const handleConvert = async () => {
    if (!file || selectedCount === 0) return;
    setProcessing(true);
    try {
      const selectedPages = pages.filter(p => p.selected).map(p => p.number);
      const fd = new FormData();
      fd.append("file", file); fd.append("format", format); fd.append("dpi", String(dpi));
      fd.append("pages", JSON.stringify(selectedPages));
      const res = await fetch("/api/pdf-to-image", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = selectedPages.length > 1 ? "pdf_images.zip" : `page_${selectedPages[0]}.${format}`;
      a.click(); URL.revokeObjectURL(url);
    } catch { alert("Gagal memproses file"); }
    finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Header activePath="/pdf-to-image" />
      <main className="flex min-h-[calc(100vh-60px)]">
        {!file ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#fdf2f8" }}>
                  <ImageIcon className="w-7 h-7 text-pink-600" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text)] mb-1">PDF ke Gambar</h1>
                <p className="text-sm text-[var(--text-muted)]">Konversi halaman PDF menjadi gambar JPG atau PNG berkualitas tinggi</p>
              </div>
              <DropZone onFiles={loadFile} accept="application/pdf" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center gap-2 mb-4 bg-white rounded-xl p-2.5 border border-[var(--border)]">
                <Button onClick={() => setPages(p => p.map(pg => ({ ...pg, selected: !allSelected })))} variant="outline" size="sm">
                  {allSelected ? "Hapus semua" : "Pilih semua"}
                </Button>
                <span className="text-xs text-[var(--text-subtle)]">{selectedCount} / {pages.length} dipilih</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {pages.map(pg => (
                  <PageThumb key={pg.number} arrayBuffer={fileAB} pageNumber={pg.number} selected={pg.selected} onToggle={() => toggle(pg.number)} />
                ))}
              </div>
            </div>
            <div className="sidebar">
              <div className="sidebar-header"><h2 className="font-bold text-[var(--text)] text-lg">PDF ke Gambar</h2></div>
              <div className="sidebar-body">
                <div>
                  <label className="label">Format Output</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["jpg","png"] as const).map(f => (
                      <button key={f} onClick={() => setFormat(f)}
                        className={`py-3 rounded-xl border-2 font-bold text-sm uppercase transition-all ${
                          format === f ? "border-brand-500 bg-brand-50 text-brand-600" : "border-[var(--border)] text-[var(--text-muted)] hover:border-brand-200"
                        }`}>
                        {f}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--text-subtle)] mt-1.5">
                    {format === "jpg" ? "Ukuran lebih kecil, cocok untuk foto" : "Lossless, cocok untuk teks & grafis"}
                  </p>
                </div>
                <div>
                  <label className="label">Kualitas (DPI)</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[{ v: 72, label: "Rendah" }, { v: 150, label: "Sedang" }, { v: 300, label: "Tinggi" }].map(opt => (
                      <button key={opt.v} onClick={() => setDpi(opt.v)}
                        className={`py-2 rounded-xl border-2 transition-all text-center ${
                          dpi === opt.v ? "border-brand-500 bg-brand-50 text-brand-600" : "border-[var(--border)] text-[var(--text-muted)] hover:border-brand-200"
                        }`}>
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[10px] opacity-70">{opt.v} DPI</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="card p-3 bg-blue-50 border-blue-100">
                  <p className="text-xs text-blue-700">
                    {selectedCount > 1 ? `${selectedCount} halaman → file ZIP` : "1 halaman → file gambar"}
                  </p>
                </div>
              </div>
              <div className="sidebar-footer space-y-2">
                <Button onClick={handleConvert} loading={processing} disabled={selectedCount === 0} fullWidth size="lg" icon={<Download className="w-5 h-5"/>}>
                  {processing ? "Mengkonversi…" : `Konversi ke ${format.toUpperCase()}`}
                </Button>
                <Button onClick={() => { setFile(null); setFileAB(null); }} variant="ghost" fullWidth size="sm">Ganti file</Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
