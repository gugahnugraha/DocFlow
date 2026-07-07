"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Scissors, Plus, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface RangeData { from: number; to: number }

function PageThumb({ file, pageNumber, small = false, selected = false, onToggle }: {
  file: File; pageNumber: number; small?: boolean; selected?: boolean; onToggle?: () => void;
}) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ab = await file.arrayBuffer(); if (!alive) return;
        const pdf = await pdfjsLib.getDocument({ data: ab }).promise; if (!alive) { pdf.destroy(); return; }
        const page = await pdf.getPage(pageNumber);
        const vp = page.getViewport({ scale: small ? 0.45 : 0.65 });
        const c = cvs.current!; c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext("2d")!, viewport: vp }).promise;
        if (alive) setLoading(false); pdf.destroy();
      } catch { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [file, pageNumber, small]);

  return (
    <div onClick={onToggle}
      className={`relative bg-white rounded-xl border-2 overflow-hidden ${onToggle ? "cursor-pointer" : ""} transition-all ${
        selected ? "border-brand-500 shadow-[0_0_0_3px_rgba(230,72,9,.12)]" : "border-[var(--border)]"
      } ${small ? "w-28" : ""}`}>
      {onToggle && (
        <div className={`absolute top-2 left-2 z-10 w-4 h-4 rounded border-2 flex items-center justify-center ${selected ? "bg-brand-500 border-brand-500" : "bg-white border-slate-300"}`}>
          {selected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
        </div>
      )}
      <div className="flex items-center justify-center min-h-[80px] p-1.5 pt-5">
        {loading ? <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" /> : <canvas ref={cvs} className="max-w-full h-auto" />}
      </div>
      <div className="text-center py-1 border-t border-[var(--border)]">
        <span className="text-[10px] font-semibold text-[var(--text-subtle)]">{pageNumber}</span>
      </div>
    </div>
  );
}

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ number: number; selected: boolean }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [splitMode, setSplitMode] = useState<"range" | "pages">("range");
  const [ranges, setRanges] = useState<RangeData[]>([{ from: 1, to: 1 }]);
  const [extractMode, setExtractMode] = useState<"all" | "select">("select");
  const [mergeAll, setMergeAll] = useState(false);

  const loadFile = useCallback(async (files: File[]) => {
    const f = files[0]; setFile(f);
    const ab = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    const n = pdf.numPages; pdf.destroy();
    setPages(Array.from({ length: n }, (_, i) => ({ number: i + 1, selected: true })));
    setRanges([{ from: 1, to: n }]);
  }, []);

  const toggle = (n: number) => setPages(p => p.map(pg => pg.number === n ? { ...pg, selected: !pg.selected } : pg));
  const addRange = () => { const last = ranges[ranges.length - 1]; const nf = last.to + 1; if (nf <= pages.length) setRanges(r => [...r, { from: nf, to: Math.min(nf, pages.length) }]); };
  const updateRange = (i: number, field: "from" | "to", val: number) => setRanges(r => r.map((rg, idx) => idx === i ? { ...rg, [field]: Math.max(1, Math.min(val, pages.length)) } : rg));
  const removeRange = (i: number) => setRanges(r => r.filter((_, idx) => idx !== i));

  const selectedCount = pages.filter(p => p.selected).length;
  const pdfCount = splitMode === "pages" ? (mergeAll ? 1 : selectedCount) : (mergeAll ? 1 : ranges.length);

  const handleSplit = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      if (splitMode === "pages") {
        fd.append("extractMode", extractMode);
        fd.append("pagesToExtract", JSON.stringify(extractMode === "select" ? pages.filter(p => p.selected).map(p => p.number) : "all"));
      } else {
        fd.append("ranges", JSON.stringify(ranges));
      }
      fd.append("mergeAll", String(mergeAll));
      const res = await fetch("/api/split", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = mergeAll ? "split.pdf" : "split.zip"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Gagal memproses file"); }
    finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Header activePath="/split" />
      <main className="flex min-h-[calc(100vh-60px)]">
        {!file ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#ecfdf5" }}>
                  <Scissors className="w-7 h-7 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Split PDF</h1>
                <p className="text-sm text-[var(--text-muted)]">Pisahkan file PDF menjadi beberapa dokumen</p>
              </div>
              <DropZone onFiles={loadFile} accept="application/pdf" />
            </div>
          </div>
        ) : (
          <>
            {/* Main canvas */}
            <div className="flex-1 overflow-y-auto p-5">
              {splitMode === "range" ? (
                <div className="flex flex-col items-center gap-6">
                  {ranges.map((range, i) => (
                    <div key={i} className="card p-5 w-full max-w-lg">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-[var(--text)]">Range {i + 1}</span>
                        {ranges.length > 1 && <button onClick={() => removeRange(i)} className="text-xs text-red-500 hover:text-red-700 font-medium">Hapus</button>}
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        {file && range.from <= pages.length && <PageThumb file={file} pageNumber={range.from} small />}
                        {range.to > range.from && <span className="text-[var(--text-subtle)] font-bold">• • •</span>}
                        {file && range.to > range.from && range.to <= pages.length && <PageThumb file={file} pageNumber={range.to} small />}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Dari halaman</label>
                          <input type="number" value={range.from} min={1} max={pages.length} onChange={e => updateRange(i, "from", +e.target.value || 1)} className="input" />
                        </div>
                        <div>
                          <label className="label">Sampai halaman</label>
                          <input type="number" value={range.to} min={1} max={pages.length} onChange={e => updateRange(i, "to", +e.target.value || 1)} className="input" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addRange} variant="outline" size="md" icon={<Plus className="w-4 h-4"/>} disabled={ranges[ranges.length-1]?.to >= pages.length}>
                    Tambah Range
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                  {pages.map(pg => (
                    <PageThumb key={pg.number} file={file} pageNumber={pg.number}
                      selected={pg.selected} onToggle={extractMode === "select" ? () => toggle(pg.number) : undefined} />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="sidebar">
              <div className="sidebar-header">
                <h2 className="font-bold text-[var(--text)] text-lg">Split PDF</h2>
                {/* Mode tabs */}
                <div className="flex gap-1 mt-3 bg-[var(--bg)] rounded-xl p-1">
                  {(["range","pages"] as const).map(m => (
                    <button key={m} onClick={() => setSplitMode(m)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${splitMode === m ? "bg-white text-[var(--text)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>
                      {m === "range" ? "Range" : "Halaman"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sidebar-body">
                {splitMode === "pages" && (
                  <div>
                    <label className="label">Mode Ekstrak</label>
                    <div className="flex gap-1.5">
                      {(["all","select"] as const).map(m => (
                        <button key={m} onClick={() => { setExtractMode(m); if (m === "all") setPages(p => p.map(pg => ({ ...pg, selected: true }))); }}
                          className={`flex-1 py-2 text-xs font-semibold rounded-xl border-2 transition-all ${extractMode === m ? "border-brand-500 bg-brand-50 text-brand-600" : "border-[var(--border)] text-[var(--text-muted)]"}`}>
                          {m === "all" ? "Semua Halaman" : "Pilih Halaman"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={mergeAll} onChange={e => setMergeAll(e.target.checked)} className="w-4 h-4 accent-brand-500 rounded" />
                  <span className="text-sm text-[var(--text-muted)]">Gabungkan semua ke satu PDF</span>
                </label>

                <div className="card p-3 bg-blue-50 border-blue-100">
                  <p className="text-xs text-blue-700">
                    Akan membuat <span className="font-bold text-blue-900">{pdfCount} PDF</span>{pdfCount > 1 ? " dalam 1 ZIP" : ""}.
                  </p>
                </div>
              </div>

              <div className="sidebar-footer space-y-2">
                <Button onClick={handleSplit} loading={processing} fullWidth size="lg" icon={<Scissors className="w-5 h-5"/>}>
                  {processing ? "Memproses…" : "Split PDF"}
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
