"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ArrowDownUp, GripVertical, RotateCcw } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";
import PdfThumb from "@/components/PdfThumb";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PageItem { originalIndex: number; originalNumber: number; key: string }

function PageCard({
  pdfDoc, page, label, isDragging, isDragOver,
  onDragStart, onDragEnter, onDragEnd, onDrop,
}: {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  page: PageItem; label: string;
  isDragging: boolean; isDragOver: boolean;
  onDragStart: () => void; onDragEnter: () => void;
  onDragEnd: () => void; onDrop: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart} onDragEnter={onDragEnter}
      onDragEnd={onDragEnd} onDragOver={e => e.preventDefault()} onDrop={onDrop}
      className={`flex flex-col items-center gap-1.5 select-none transition-all duration-150 ${
        isDragging ? "opacity-40 scale-95" : isDragOver ? "scale-105" : ""
      }`}
    >
      <div className={`relative bg-white rounded-xl border-2 overflow-hidden cursor-grab active:cursor-grabbing shadow-sm transition-all w-full ${
        isDragOver
          ? "border-brand-500 shadow-[0_0_0_3px_rgba(230,72,9,.15)]"
          : "border-[var(--border)] hover:border-brand-200"
      }`}>
        <div className="absolute top-1.5 left-1.5 z-10 text-[var(--text-subtle)]">
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <div className="aspect-[3/4] overflow-hidden">
          <PdfThumb pdfDoc={pdfDoc} pageNumber={page.originalNumber} scale={0.5} />
        </div>
      </div>
      <span className="text-xs font-semibold text-[var(--text-subtle)]">{label}</span>
    </div>
  );
}

export default function ReorderPage() {
  const [file, setFile]           = useState<File | null>(null);
  const [pdfDoc, setPdfDoc]       = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pages, setPages]         = useState<PageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragSrc, setDragSrc]     = useState<number | null>(null);
  const [dragOver, setDragOver]   = useState<number | null>(null);

  // Destroy old doc when new one is loaded
  const prevDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const loadFile = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setPdfDoc(null);
    setPages([]);

    // Destroy previous doc
    if (prevDocRef.current) { prevDocRef.current.destroy(); prevDocRef.current = null; }

    const data = new Uint8Array(await f.arrayBuffer());
    const doc  = await pdfjsLib.getDocument({ data }).promise;
    prevDocRef.current = doc;
    setPdfDoc(doc);
    setPages(Array.from({ length: doc.numPages }, (_, i) => ({
      originalIndex: i,
      originalNumber: i + 1,
      key: `page-${i}`,
    })));
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { prevDocRef.current?.destroy(); }, []);

  const onDrop = (dropIdx: number) => {
    if (dragSrc === null || dragSrc === dropIdx) return;
    setPages(prev => {
      const next = [...prev];
      const [m] = next.splice(dragSrc, 1);
      next.splice(dropIdx, 0, m);
      return next;
    });
    setDragSrc(null); setDragOver(null);
  };

  const isOriginal = pages.every((p, i) => p.originalIndex === i);

  const handleSave = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("order", JSON.stringify(pages.map(p => p.originalIndex)));
      const res = await fetch("/api/reorder", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a"); a.href = url; a.download = "reordered.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Gagal memproses file"); }
    finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Header activePath="/reorder" />
      <main className="flex min-h-[calc(100vh-60px)]">
        {!file ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "#e0f2fe" }}>
                  <ArrowDownUp className="w-7 h-7" style={{ color: "#0284c7" }} />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Susun Ulang Halaman</h1>
                <p className="text-sm text-[var(--text-muted)]">Drag & drop halaman untuk mengatur ulang urutan PDF</p>
              </div>
              <DropZone onFiles={loadFile} accept="application/pdf" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center gap-2 mb-5 bg-white rounded-xl p-2.5 border border-[var(--border)]">
                <span className="text-sm font-semibold text-[var(--text-muted)]">{pages.length} halaman</span>
                <div className="w-px h-4 bg-[var(--border)]" />
                <Button onClick={() => setPages(p => [...p].reverse())} variant="outline" size="sm"
                  icon={<ArrowDownUp className="w-3.5 h-3.5" />}>Balik Urutan</Button>
                {!isOriginal && (
                  <Button
                    onClick={() => setPages(p => [...p].sort((a, b) => a.originalIndex - b.originalIndex))}
                    variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />}>Reset</Button>
                )}
                {!isOriginal && (
                  <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg font-medium">
                    Urutan diubah
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10 gap-3">
                {pages.map((p, i) => (
                  <PageCard key={p.key} pdfDoc={pdfDoc} page={p} label={String(i + 1)}
                    isDragging={dragSrc === i} isDragOver={dragOver === i}
                    onDragStart={() => setDragSrc(i)} onDragEnter={() => setDragOver(i)}
                    onDragEnd={() => { setDragSrc(null); setDragOver(null); }}
                    onDrop={() => onDrop(i)} />
                ))}
              </div>
              <p className="text-center text-xs text-[var(--text-subtle)] mt-6">
                Seret halaman untuk mengubah urutan. Nomor di bawah adalah posisi baru.
              </p>
            </div>

            <div className="sidebar">
              <div className="sidebar-header">
                <h2 className="font-bold text-[var(--text)] text-lg">Susun Halaman</h2>
              </div>
              <div className="sidebar-body">
                <div className="card p-3">
                  <p className="text-xs text-[var(--text-muted)] font-semibold mb-1">Urutan saat ini</p>
                  <p className="text-xs text-[var(--text-subtle)] leading-relaxed">
                    {pages.map(p => p.originalNumber).join(" → ")}
                  </p>
                </div>
                {!isOriginal && (
                  <div className="card p-3 bg-amber-50 border-amber-100">
                    <p className="text-xs text-amber-700">Urutan berbeda dari dokumen asli.</p>
                  </div>
                )}
              </div>
              <div className="sidebar-footer space-y-2">
                <Button onClick={handleSave} loading={processing} disabled={isOriginal}
                  fullWidth size="lg" icon={<ArrowDownUp className="w-5 h-5" />}>
                  {processing ? "Memproses…" : "Simpan PDF"}
                </Button>
                <Button onClick={() => { setFile(null); setPdfDoc(null); setPages([]); }} variant="ghost" fullWidth size="sm">
                  Ganti file
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
