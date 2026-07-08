"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { X, Plus, FileType, Loader2 } from "lucide-react";
import Link from "next/link";
import * as pdfjsLib from "pdfjs-dist";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/lib/i18n/LanguageContext";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface FileItem { id: string; file: File }

function FileThumb({ item, onRemove }: { item: FileItem; onRemove: () => void }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ab = await item.file.arrayBuffer();
        if (!alive) return;
        const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
        if (!alive) { pdf.destroy(); return; }
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 0.7 });
        const c = cvs.current!;
        c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext("2d")!, viewport: vp }).promise;
        if (alive) setLoading(false);
        pdf.destroy();
      } catch { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [item]);

  return (
    <div className="card group relative flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <button onClick={onRemove}
        className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/75 backdrop-blur-xl border border-white/35 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md">
        <X className="w-3 h-3" />
      </button>
      <div className="bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center min-h-[120px] p-2">
        {loading && <div className="w-5 h-5 border-2 border-slate-200 border-t-orange-500 rounded-full animate-spin" />}
        <canvas ref={cvs} className="w-full h-auto" style={{ display: loading ? "none" : "block" }} />
      </div>
      <div className="p-2 border-t border-[var(--border)]">
        <p className="text-[11px] text-[var(--text-muted)] truncate font-medium">{item.file.name}</p>
        <p className="text-[10px] text-[var(--text-subtle)]">{(item.file.size / 1024).toFixed(0)} KB</p>
      </div>
    </div>
  );
}

export default function MergePage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles.map(f => ({ id: crypto.randomUUID(), file: f }))]);
  }, []);

  const remove = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const handleMerge = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append("files", f.file));
      const res = await fetch("/api/merge", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "merged.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert(t.common.errors.processingFailed); }
    finally { setProcessing(false); }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Header activePath="/merge" />
        <main className="flex min-h-[calc(100vh-60px)]">
          {files.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-lg">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileType className="w-8 h-8 text-brand-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{t.pages.merge.title}</h1>
                  <p className="text-sm text-[var(--text-muted)]">{t.pages.merge.subtitle}</p>
                </div>
                <DropZone onFiles={addFiles} accept="application/pdf" multiple />
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[
                    { icon: <FileType className="w-4 h-4" />, label: t.pages.merge.steps.select },
                    { icon: <Plus className="w-4 h-4" />, label: t.pages.merge.steps.add },
                    { icon: <X className="w-4 h-4" />, label: t.pages.merge.steps.remove },
                    { icon: <FileType className="w-4 h-4" />, label: t.pages.merge.steps.merge },
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
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {files.map(item => (
                    <FileThumb key={item.id} item={item} onRemove={() => remove(item.id)} />
                  ))}
                  <label className="cursor-pointer">
                    <input type="file" accept="application/pdf" multiple onChange={e => e.target.files && addFiles(Array.from(e.target.files))} className="hidden" />
                    <div className="flex flex-col items-center justify-center min-h-[140px] rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-orange-300 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 transition-all duration-300 text-[var(--text-subtle)] gap-2 hover:-translate-y-0.5">
                      <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-semibold">{t.common.actions.add}</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="sidebar">
                <div className="sidebar-header">
                  <h2 className="font-bold text-[var(--text)] text-lg">{t.pages.merge.title}</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{files.length} {t.pages.merge.selectedFiles}</p>
                </div>
                <div className="sidebar-body">
                  <div className="card p-3 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                    <p className="text-xs text-orange-700 leading-relaxed">
                      {t.pages.merge.hint}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {files.map((f, i) => (
                      <div key={f.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200">
                        <span className="text-xs font-bold text-orange-500 w-5">{i + 1}</span>
                        <p className="text-xs text-[var(--text)] truncate flex-1">{f.file.name}</p>
                        <button onClick={() => remove(f.id)} className="text-[var(--text-subtle)] hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sidebar-footer space-y-2">
                  <Button onClick={handleMerge} loading={processing} disabled={files.length < 2} fullWidth size="lg"
                    icon={<FileType className="w-5 h-5" />}>
                    {processing ? t.common.actions.processing : t.pages.merge.title}
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
