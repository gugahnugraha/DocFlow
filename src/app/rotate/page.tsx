"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { RotateCw, RotateCcw } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PageState { number: number; rotation: number; selected: boolean }

function PageThumb({ file, page, onCW, onCCW, onToggle }: {
  file: File; page: PageState; onCW: () => void; onCCW: () => void; onToggle: () => void;
}) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ab = await file.arrayBuffer();
        if (!alive) return;
        const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
        if (!alive) { pdf.destroy(); return; }
        const p = await pdf.getPage(page.number);
        const vp = p.getViewport({ scale: 0.6, rotation: page.rotation });
        const c = cvs.current!;
        c.width = vp.width; c.height = vp.height;
        await p.render({ canvasContext: c.getContext("2d")!, viewport: vp }).promise;
        if (alive) setLoading(false);
        pdf.destroy();
      } catch { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [file, page.number, page.rotation]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div onClick={onToggle}
        className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
          page.selected ? "border-brand-500 shadow-[0_0_0_3px_rgba(230,72,9,.15)]" : "border-[var(--border)] hover:border-brand-300"
        } bg-white`}>
        {page.rotation !== 0 && (
          <span className="absolute top-1.5 right-1.5 z-10 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {page.rotation}°
          </span>
        )}
        <div className={`absolute top-1.5 left-1.5 z-10 w-4 h-4 rounded border-2 flex items-center justify-center ${
          page.selected ? "bg-brand-500 border-brand-500" : "bg-white border-slate-300"
        }`}>
          {page.selected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
        </div>
        <div className="flex items-center justify-center min-w-[90px] min-h-[110px] p-2 pt-6">
          {loading ? <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" /> : <canvas ref={cvs} className="max-w-full h-auto" />}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={e => { e.stopPropagation(); onCCW(); }} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors"><RotateCcw className="w-3.5 h-3.5"/></button>
        <span className="text-xs font-semibold text-[var(--text-subtle)] w-7 text-center">{page.number}</span>
        <button onClick={e => { e.stopPropagation(); onCW(); }} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors"><RotateCw className="w-3.5 h-3.5"/></button>
      </div>
    </div>
  );
}

export default function RotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageState[]>([]);
  const [processing, setProcessing] = useState(false);

  const loadFile = useCallback(async (files: File[]) => {
    const f = files[0]; setFile(f);
    const ab = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    setPages(Array.from({ length: pdf.numPages }, (_, i) => ({ number: i + 1, rotation: 0, selected: true })));
    pdf.destroy();
  }, []);

  const rotate = (i: number, d: number) => setPages(p => p.map((pg, idx) => idx === i ? { ...pg, rotation: (pg.rotation + d + 360) % 360 } : pg));
  const rotateSelected = (d: number) => setPages(p => p.map(pg => pg.selected ? { ...pg, rotation: (pg.rotation + d + 360) % 360 } : pg));
  const toggle = (i: number) => setPages(p => p.map((pg, idx) => idx === i ? { ...pg, selected: !pg.selected } : pg));
  const allSelected = pages.every(p => p.selected);
  const hasChanges = pages.some(p => p.rotation !== 0);

  const handleRotate = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const rotations: Record<string, number> = {};
      pages.forEach((p, i) => { if (p.rotation !== 0) rotations[i] = p.rotation; });
      const fd = new FormData();
      fd.append("file", file); fd.append("rotations", JSON.stringify(rotations));
      const res = await fetch("/api/rotate", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "rotated.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Gagal memproses file"); }
    finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Header activePath="/rotate" />
      <main className="flex min-h-[calc(100vh-60px)]">
        {!file ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#ecfeff" }}>
                  <RotateCw className="w-7 h-7" style={{ color: "#0891b2" }} />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Rotate PDF</h1>
                <p className="text-sm text-[var(--text-muted)]">Putar halaman PDF secara individual atau semua sekaligus</p>
              </div>
              <DropZone onFiles={loadFile} accept="application/pdf" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center gap-2 mb-5 bg-white rounded-xl p-2.5 border border-[var(--border)]">
                <Button onClick={() => setPages(p => p.map(pg => ({ ...pg, selected: !allSelected })))} variant="outline" size="sm">
                  {allSelected ? "Hapus pilihan" : "Pilih semua"}
                </Button>
                <span className="text-xs text-[var(--text-subtle)]">{pages.filter(p => p.selected).length} dipilih</span>
                <div className="w-px h-5 bg-[var(--border)]" />
                <Button onClick={() => rotateSelected(270)} variant="outline" size="sm" icon={<RotateCcw className="w-3.5 h-3.5"/>}>Kiri</Button>
                <Button onClick={() => rotateSelected(90)} variant="outline" size="sm" icon={<RotateCw className="w-3.5 h-3.5"/>}>Kanan</Button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {pages.map((page, i) => (
                  <PageThumb key={page.number} file={file} page={page}
                    onCW={() => rotate(i, 90)} onCCW={() => rotate(i, 270)} onToggle={() => toggle(i)} />
                ))}
              </div>
            </div>
            <div className="sidebar">
              <div className="sidebar-header">
                <h2 className="font-bold text-[var(--text)] text-lg">Rotate PDF</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{pages.length} halaman</p>
              </div>
              <div className="sidebar-body">
                <div className="card p-3 bg-blue-50 border-blue-100">
                  <p className="text-xs text-blue-700 leading-relaxed">Klik ikon putar di bawah setiap halaman, atau pilih beberapa halaman dan gunakan tombol bulk.</p>
                </div>
                {hasChanges && (
                  <div className="card p-3 bg-amber-50 border-amber-100">
                    <p className="text-xs text-amber-700 font-medium">{pages.filter(p => p.rotation !== 0).length} halaman akan dirotasi</p>
                  </div>
                )}
              </div>
              <div className="sidebar-footer space-y-2">
                <Button onClick={handleRotate} loading={processing} disabled={!hasChanges} fullWidth size="lg" icon={<RotateCw className="w-5 h-5"/>}>
                  {processing ? "Memproses…" : "Rotate PDF"}
                </Button>
                <Button onClick={() => { setFile(null); setPages([]); }} variant="ghost" fullWidth size="sm">Ganti file</Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
