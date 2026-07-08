"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Scissors, Plus, X, FileText, ChevronRight, FileType } from "lucide-react";
import Link from "next/link";
import * as pdfjsLib from "pdfjs-dist";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";
import PdfThumb from "@/components/PdfThumb";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/lib/i18n/LanguageContext";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface RangeData { from: number; to: number }

/* ── Selectable page thumbnail (pages mode) ─────────────────────────────── */
function PageCard({
  pdfDoc, pageNumber, selected, onToggle,
}: {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  pageNumber: number; selected: boolean; onToggle?: () => void;
}) {
  return (
    <div onClick={onToggle}
      className={`relative bg-white/55 backdrop-blur-xl rounded-xl border-2 overflow-hidden transition-all ${
        onToggle ? "cursor-pointer" : ""
      } ${selected
          ? "border-brand-500 shadow-[0_0_0_3px_rgba(230,72,9,.12)]"
          : "border-white/35 hover:border-brand-200"
      }`}>
      {onToggle && (
        <div className={`absolute top-2 left-2 z-10 w-4 h-4 rounded border-2 flex items-center justify-center ${
          selected ? "bg-brand-500 border-brand-500" : "bg-white/70 backdrop-blur-xl border-white/40"
        }`}>
          {selected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
        </div>
      )}
      <div className="aspect-[3/4] overflow-hidden">
        <PdfThumb pdfDoc={pdfDoc} pageNumber={pageNumber} scale={0.55} />
      </div>
      <div className="text-center py-1 border-t border-[var(--border)]">
        <span className="text-[10px] font-semibold text-[var(--text-subtle)]">{pageNumber}</span>
      </div>
    </div>
  );
}

/* ── Range card — redesigned ─────────────────────────────────────────────── */
function RangeCard({
  pdfDoc, range, index, totalPages, isOnly,
  onUpdate, onRemove,
}: {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  range: RangeData; index: number; totalPages: number; isOnly: boolean;
  onUpdate: (field: "from" | "to", val: number) => void;
  onRemove: () => void;
}) {
  const { t } = useLanguage();
  const pageCount = Math.max(0, range.to - range.from + 1);
  const previewPages: number[] = [];

  // Show up to 5 preview pages evenly distributed within the range
  if (pageCount <= 5) {
    for (let p = range.from; p <= range.to; p++) previewPages.push(p);
  } else {
    previewPages.push(range.from);
    const step = (range.to - range.from) / 4;
    for (let i = 1; i <= 3; i++) previewPages.push(Math.round(range.from + step * i));
    previewPages.push(range.to);
  }

  return (
    <div className="card overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/30 bg-white/35 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
            {index + 1}
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text)]">
              {t.pages.split.rangeCard.pagesPrefix} {range.from}{range.to > range.from ? ` – ${range.to}` : ""}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {pageCount} {t.pages.split.rangeCard.pagesUnit} · {pageCount === totalPages ? t.pages.split.rangeCard.wholeDocument : `${Math.round(pageCount / totalPages * 100)}% ${t.pages.split.rangeCard.documentUnit}`}
            </p>
          </div>
        </div>
        {!isOnly && (
          <button onClick={onRemove}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-subtle)] hover:text-red-500 hover:bg-red-50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Preview strip */}
      <div className="px-5 py-4">
        <div className="flex items-stretch gap-2">
          {previewPages.map((pageNum, i) => (
            <div key={pageNum} className="flex items-center gap-2 flex-1 min-w-0">
              {/* Page thumbnail */}
              <div className="flex-1 min-w-0">
                <div className="bg-white/55 backdrop-blur-xl border border-white/35 rounded-lg overflow-hidden shadow-sm">
                  <div className="aspect-[3/4] overflow-hidden">
                    <PdfThumb pdfDoc={pdfDoc} pageNumber={pageNum} scale={0.7} />
                  </div>
                  <div className="text-center py-1 border-t border-white/30 bg-white/40 backdrop-blur-xl">
                    <span className="text-[10px] font-semibold text-[var(--text-subtle)]">{pageNum}</span>
                  </div>
                </div>
              </div>
              {/* Arrow between pages (not after last) */}
              {i < previewPages.length - 1 && (
                <div className="flex flex-col items-center gap-1 flex-shrink-0 text-[var(--border)]">
                  {/* Show ellipsis if pages aren't consecutive */}
                  {previewPages[i + 1] - pageNum > 1 ? (
                    <span className="text-[var(--text-subtle)] font-bold text-sm leading-none">···</span>
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Range inputs */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
          <label className="label">{t.pages.split.fromPage}</label>
            <div className="relative">
              <input
                type="number" value={range.from} min={1} max={range.to}
                onChange={e => onUpdate("from", +e.target.value || 1)}
                className="input text-center font-semibold text-sm pr-10"
              />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-subtle)]">{t.common.units.pageShort}</span>
            </div>
          </div>
          <div>
          <label className="label">{t.pages.split.toPage}</label>
            <div className="relative">
              <input
                type="number" value={range.to} min={range.from} max={totalPages}
                onChange={e => onUpdate("to", +e.target.value || 1)}
                className="input text-center font-semibold text-sm pr-10"
              />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-subtle)]">{t.common.units.pageShort}</span>
            </div>
          </div>
        </div>

        {/* Page count bar */}
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${Math.round(pageCount / totalPages * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[var(--text-subtle)]">{t.common.units.pageAbbrev} 1</span>
            <span className="text-[10px] text-brand-500 font-semibold">{pageCount} {t.pages.split.rangeCard.selectedSuffix}</span>
            <span className="text-[10px] text-[var(--text-subtle)]">{t.common.units.pageAbbrev} {totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function SplitPage() {
  const { t } = useLanguage();
  const [file, setFile]               = useState<File | null>(null);
  const [pdfDoc, setPdfDoc]           = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pages, setPages]             = useState<{ number: number; selected: boolean }[]>([]);
  const [processing, setProcessing]   = useState(false);
  const [splitMode, setSplitMode]     = useState<"range" | "pages">("range");
  const [ranges, setRanges]           = useState<RangeData[]>([{ from: 1, to: 1 }]);
  const [extractMode, setExtractMode] = useState<"all" | "select">("select");
  const [mergeAll, setMergeAll]       = useState(false);
  const prevDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const loadFile = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f); setPdfDoc(null); setPages([]);
    if (prevDocRef.current) { prevDocRef.current.destroy(); prevDocRef.current = null; }

    const data = new Uint8Array(await f.arrayBuffer());
    const doc  = await pdfjsLib.getDocument({ data }).promise;
    prevDocRef.current = doc;
    setPdfDoc(doc);

    const n = doc.numPages;
    setPages(Array.from({ length: n }, (_, i) => ({ number: i + 1, selected: true })));
    setRanges([{ from: 1, to: n }]);
  }, []);

  useEffect(() => () => { prevDocRef.current?.destroy(); }, []);

  const toggle = (n: number) =>
    setPages(p => p.map(pg => pg.number === n ? { ...pg, selected: !pg.selected } : pg));

  const addRange = () => {
    const last = ranges[ranges.length - 1];
    const nf   = last.to + 1;
    if (nf <= pages.length) setRanges(r => [...r, { from: nf, to: Math.min(nf, pages.length) }]);
  };
  const updateRange = (i: number, field: "from" | "to", val: number) =>
    setRanges(r => r.map((rg, idx) => idx === i ? { ...rg, [field]: Math.max(1, Math.min(val, pages.length)) } : rg));
  const removeRange = (i: number) =>
    setRanges(r => r.filter((_, idx) => idx !== i));

  const selectedCount = pages.filter(p => p.selected).length;
  const pdfCount = splitMode === "pages"
    ? (mergeAll ? 1 : selectedCount)
    : (mergeAll ? 1 : ranges.length);

  const handleSplit = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (splitMode === "pages") {
        fd.append("extractMode", extractMode);
        fd.append("pagesToExtract", JSON.stringify(
          extractMode === "select"
            ? pages.filter(p => p.selected).map(p => p.number)
            : "all"
        ));
      } else {
        fd.append("ranges", JSON.stringify(ranges));
      }
      fd.append("mergeAll", String(mergeAll));
      const res = await fetch("/api/split", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = mergeAll ? "split.pdf" : "split.zip"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert(t.common.errors.processingFailed); }
    finally { setProcessing(false); }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Header activePath="/split" />
        <main className="flex flex-col lg:flex-row min-h-[calc(100vh-60px)]">

          {/* ── Upload state ── */}
          {!file ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-lg">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Scissors className="w-8 h-8 text-brand-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{t.pages.split.title}</h1>
                  <p className="text-sm text-[var(--text-muted)]">{t.pages.split.subtitle}</p>
                </div>
                <DropZone onFiles={loadFile} accept="application/pdf" />
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[
                    { icon: <FileType className="w-4 h-4" />, label: t.pages.merge.steps.select },
                    { icon: <Scissors className="w-4 h-4" />, label: t.pages.split.rangeTab },
                    { icon: <FileText className="w-4 h-4" />, label: t.pages.split.pagesTab },
                    { icon: <FileText className="w-4 h-4" />, label: t.common.actions.download },
                  ].map(f => (
                    <div key={f.label} className="card flex flex-col items-center gap-1.5 p-3 text-center">
                      <span className="text-brand-500">{f.icon}</span>
                      <span className="text-xs font-medium text-[var(--text-muted)]">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          ) : (
            <>
              {/* ── Main area ── */}
              <div className="flex-1 overflow-y-auto p-6">

                {splitMode === "range" ? (
                  /* Range mode */
                  <div className="max-w-3xl mx-auto space-y-4">
                    {ranges.map((range, i) => (
                      <RangeCard
                        key={i}
                        pdfDoc={pdfDoc}
                        range={range}
                        index={i}
                        totalPages={pages.length}
                        isOnly={ranges.length === 1}
                        onUpdate={(field, val) => updateRange(i, field, val)}
                        onRemove={() => removeRange(i)}
                      />
                    ))}

                    {/* Add range button */}
                    {ranges[ranges.length - 1]?.to < pages.length && (
                      <button
                        onClick={addRange}
                        className="w-full py-4 rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-brand-300 hover:bg-brand-50/40 transition-all flex items-center justify-center gap-2 text-sm font-semibold text-[var(--text-muted)] hover:text-brand-600"
                      >
                        <div className="w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                        {t.pages.split.addRange}
                      </button>
                    )}
                  </div>

                ) : (
                  /* Pages mode */
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4 bg-white/55 backdrop-blur-xl rounded-xl p-3 border border-white/35">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-[var(--text-muted)]">{pages.length} {t.pages.split.pagesTotal}</span>
                        <span className="text-xs text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full font-semibold">
                          {selectedCount} {t.pages.split.selected}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPages(p => p.map(pg => ({ ...pg, selected: true })))}
                          className="text-xs font-medium text-[var(--text-muted)] hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
                        >
                          {t.pages.split.selectAll}
                        </button>
                        <button
                          onClick={() => setPages(p => p.map(pg => ({ ...pg, selected: false })))}
                          className="text-xs font-medium text-[var(--text-muted)] hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          {t.pages.split.clearAll}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                      {pages.map(pg => (
                        <PageCard
                          key={pg.number} pdfDoc={pdfDoc} pageNumber={pg.number}
                          selected={pg.selected}
                          onToggle={extractMode === "select" ? () => toggle(pg.number) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Sidebar ── */}
              <div className="sidebar">
                <div className="sidebar-header">
                  <h2 className="font-bold text-[var(--text)] text-lg">{t.pages.split.title}</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 mb-3">
                    {file.name} · {pages.length} {t.pages.split.pagesTotal} · {(file.size / 1024).toFixed(0)} KB
                  </p>
                  {/* Mode tabs */}
                  <div className="flex gap-1 bg-white/35 backdrop-blur-xl border border-white/30 rounded-xl p-1">
                    {(["range", "pages"] as const).map(m => (
                      <button key={m} onClick={() => setSplitMode(m)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                          splitMode === m
                            ? "bg-white/75 backdrop-blur-xl text-[var(--text)] shadow-sm"
                            : "text-[var(--text-muted)] hover:text-[var(--text)]"
                        }`}>
                        {m === "range" ? t.pages.split.rangeTab : t.pages.split.pagesTab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sidebar-body">
                  {/* Range mode description */}
                  {splitMode === "range" && (
                    <div className="card p-3 bg-white/40">
                      <p className="text-xs font-semibold text-[var(--text)] mb-1">{t.pages.split.rangeModeTitle}</p>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {t.pages.split.rangeModeDesc}
                      </p>
                    </div>
                  )}

                  {/* Pages mode extract options */}
                  {splitMode === "pages" && (
                    <div>
                      <label className="label">{t.pages.split.extractModeLabel}</label>
                      <div className="flex gap-1.5">
                        {(["all", "select"] as const).map(m => (
                          <button key={m}
                            onClick={() => {
                              setExtractMode(m);
                              if (m === "all") setPages(p => p.map(pg => ({ ...pg, selected: true })));
                            }}
                            className={`flex-1 py-2 text-xs font-semibold rounded-xl border-2 transition-all ${
                              extractMode === m
                                ? "border-brand-500 bg-brand-50 text-brand-600"
                                : "border-white/35 bg-white/35 backdrop-blur-xl text-[var(--text-muted)] hover:border-brand-200"
                            }`}>
                            {m === "all" ? t.pages.split.extractAll : t.pages.split.extractSelect}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="card p-3 text-center">
                      <p className="text-2xl font-extrabold text-brand-500">{pdfCount}</p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{t.pages.split.outputFiles}</p>
                    </div>
                    <div className="card p-3 text-center">
                      <p className="text-2xl font-extrabold text-[var(--text)]">
                        {splitMode === "pages" ? selectedCount : ranges.reduce((acc, r) => acc + Math.max(0, r.to - r.from + 1), 0)}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{t.pages.split.pageProcessed}</p>
                    </div>
                  </div>

                  {/* Merge toggle */}
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-white/35 bg-white/35 backdrop-blur-xl hover:border-brand-200 hover:bg-white/45 transition-all">
                    <input type="checkbox" checked={mergeAll} onChange={e => setMergeAll(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-brand-500 rounded flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">{t.pages.split.mergeIntoOne}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {t.pages.split.mergeIntoOneDesc}
                      </p>
                    </div>
                  </label>

                  {/* Output info */}
                  <div className="card p-3 bg-emerald-50 border-emerald-100">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <p className="text-xs font-semibold text-emerald-700">{t.pages.split.outputLabel}</p>
                    </div>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      {mergeAll
                        ? t.pages.split.outputSinglePdf
                        : pdfCount > 1
                        ? `${t.pages.split.outputZipPrefix} ${pdfCount} ${t.pages.split.outputZipSuffix}`
                        : t.pages.split.outputSinglePdf}
                    </p>
                  </div>
                </div>

                <div className="sidebar-footer space-y-2">
                  <Button onClick={handleSplit} loading={processing} fullWidth size="lg"
                    icon={<Scissors className="w-5 h-5" />}>
                    {processing ? t.common.actions.processing : t.pages.split.title}
                  </Button>
                  <Link href="/">
                    <Button variant="ghost" fullWidth size="sm">
                      {t.common.actions.changeFile}
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
