"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { RotateCw, RotateCcw } from "lucide-react";
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

interface PageState { number: number; rotation: number; selected: boolean }

function PageCard({
  pdfDoc, page, onCW, onCCW, onToggle,
}: {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  page: PageState;
  onCW: () => void; onCCW: () => void; onToggle: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        onClick={onToggle}
        className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all w-full ${
          page.selected
            ? "border-brand-500 shadow-[0_0_0_3px_rgba(230,72,9,.15)]"
            : "border-[var(--border)] hover:border-brand-300"
        } bg-white`}
      >
        {/* Rotation badge */}
        {page.rotation !== 0 && (
          <span className="absolute top-1.5 right-1.5 z-10 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {page.rotation}°
          </span>
        )}
        {/* Checkbox */}
        <div className={`absolute top-1.5 left-1.5 z-10 w-4 h-4 rounded border-2 flex items-center justify-center ${
          page.selected ? "bg-brand-500 border-brand-500" : "bg-white border-slate-300"
        }`}>
          {page.selected && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="aspect-[3/4] overflow-hidden">
          <PdfThumb pdfDoc={pdfDoc} pageNumber={page.number} scale={0.5} rotation={page.rotation} />
        </div>
      </div>
      {/* Rotate buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={e => { e.stopPropagation(); onCCW(); }}
          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-semibold text-[var(--text-subtle)] w-7 text-center">{page.number}</span>
        <button
          onClick={e => { e.stopPropagation(); onCW(); }}
          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function RotatePage() {
  const { t } = useLanguage();
  const [file, setFile]             = useState<File | null>(null);
  const [pdfDoc, setPdfDoc]         = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pages, setPages]           = useState<PageState[]>([]);
  const [processing, setProcessing] = useState(false);
  const prevDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const loadFile = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f); setPdfDoc(null); setPages([]);
    if (prevDocRef.current) { prevDocRef.current.destroy(); prevDocRef.current = null; }

    const data = new Uint8Array(await f.arrayBuffer());
    const doc  = await pdfjsLib.getDocument({ data }).promise;
    prevDocRef.current = doc;
    setPdfDoc(doc);
    setPages(Array.from({ length: doc.numPages }, (_, i) => ({
      number: i + 1, rotation: 0, selected: true,
    })));
  }, []);

  useEffect(() => () => { prevDocRef.current?.destroy(); }, []);

  const rotate = (i: number, d: number) =>
    setPages(p => p.map((pg, idx) => idx === i ? { ...pg, rotation: (pg.rotation + d + 360) % 360 } : pg));
  const rotateSelected = (d: number) =>
    setPages(p => p.map(pg => pg.selected ? { ...pg, rotation: (pg.rotation + d + 360) % 360 } : pg));
  const toggle = (i: number) =>
    setPages(p => p.map((pg, idx) => idx === i ? { ...pg, selected: !pg.selected } : pg));
  const allSelected = pages.every(p => p.selected);
  const hasChanges  = pages.some(p => p.rotation !== 0);

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
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a"); a.href = url; a.download = "rotated.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert(t.common.errors.processingFailed); }
    finally { setProcessing(false); }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Header activePath="/rotate" />
        <main className="flex min-h-[calc(100vh-60px)]">
          {!file ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-lg">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <RotateCw className="w-8 h-8 text-brand-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{t.pages.rotate.title}</h1>
                  <p className="text-sm text-[var(--text-muted)]">{t.pages.rotate.subtitle}</p>
                </div>
                <DropZone onFiles={loadFile} accept="application/pdf" />
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[
                    { icon: <RotateCw className="w-4 h-4" />, label: t.pages.merge.steps.select },
                    { icon: <RotateCcw className="w-4 h-4" />, label: t.common.actions.left },
                    { icon: <RotateCw className="w-4 h-4" />, label: t.common.actions.right },
                    { icon: <RotateCw className="w-4 h-4" />, label: t.common.actions.save },
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
              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex items-center gap-2 mb-5 bg-white rounded-xl p-2.5 border border-[var(--border)]">
                  <Button onClick={() => setPages(p => p.map(pg => ({ ...pg, selected: !allSelected })))}
                    variant="outline" size="sm">
                    {allSelected ? t.common.actions.clearSelection : t.common.actions.selectAll}
                  </Button>
                  <span className="text-xs text-[var(--text-subtle)]">{pages.filter(p => p.selected).length} {t.pages.rotate.selectedSuffix}</span>
                  <div className="w-px h-5 bg-[var(--border)]" />
                  <Button onClick={() => rotateSelected(270)} variant="outline" size="sm"
                    icon={<RotateCcw className="w-3.5 h-3.5" />}>{t.common.actions.left}</Button>
                  <Button onClick={() => rotateSelected(90)} variant="outline" size="sm"
                    icon={<RotateCw className="w-3.5 h-3.5" />}>{t.common.actions.right}</Button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-4">
                  {pages.map((page, i) => (
                    <PageCard key={page.number} pdfDoc={pdfDoc} page={page}
                      onCW={() => rotate(i, 90)} onCCW={() => rotate(i, 270)} onToggle={() => toggle(i)} />
                  ))}
                </div>
              </div>

              <div className="sidebar">
                <div className="sidebar-header">
                  <h2 className="font-bold text-[var(--text)] text-lg">{t.pages.rotate.title}</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{pages.length} {t.pages.rotate.pagesUnit}</p>
                </div>
                <div className="sidebar-body">
                  <div className="card p-3 bg-blue-50 border-blue-100">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      {t.pages.rotate.hint}
                    </p>
                  </div>
                  {hasChanges && (
                    <div className="card p-3 bg-amber-50 border-amber-100">
                      <p className="text-xs text-amber-700 font-medium">
                        {pages.filter(p => p.rotation !== 0).length} {t.pages.rotate.willRotateSuffix}
                      </p>
                    </div>
                  )}
                </div>
                <div className="sidebar-footer space-y-2">
                  <Button onClick={handleRotate} loading={processing} disabled={!hasChanges}
                    fullWidth size="lg" icon={<RotateCw className="w-5 h-5" />}>
                    {processing ? t.common.actions.processing : t.pages.rotate.title}
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
