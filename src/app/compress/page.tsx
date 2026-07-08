"use client";

import { useState, useCallback } from "react";
import { FileText } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";
import PdfPreview from "@/components/PdfPreview";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CompressPage() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [quality, setQuality] = useState<"recommended" | "low" | "extreme">("recommended");

  const QUALITY_OPTIONS = [
    { id: "recommended", label: t.pages.compress.quality.recommended.label, desc: t.pages.compress.quality.recommended.desc, color: "#059669", bg: "#ecfdf5", size: "~74%" },
    { id: "low",         label: t.pages.compress.quality.low.label,         desc: t.pages.compress.quality.low.desc,         color: "#0284c7", bg: "#e0f2fe", size: "~60%" },
    { id: "extreme",     label: t.pages.compress.quality.extreme.label,     desc: t.pages.compress.quality.extreme.desc,     color: "#e64809", bg: "#fff2ee", size: "~88%" },
  ] as const;

  const loadFile = useCallback((files: File[]) => setFile(files[0]), []);

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("quality", quality);
      const res = await fetch("/api/compress", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "compressed.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch { alert(t.common.errors.processingFailed); }
    finally { setProcessing(false); }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Header activePath="/compress" />
        <main className="flex flex-col lg:flex-row min-h-[calc(100vh-60px)]">
          {!file ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-lg">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-brand-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{t.pages.compress.title}</h1>
                  <p className="text-sm text-[var(--text-muted)]">{t.pages.compress.subtitle}</p>
                </div>
                <DropZone onFiles={loadFile} accept="application/pdf" />
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[
                    { icon: <FileText className="w-4 h-4" />, label: t.pages.compress.steps.select },
                    { icon: <FileText className="w-4 h-4" />, label: t.pages.compress.steps.recommended },
                    { icon: <FileText className="w-4 h-4" />, label: t.pages.compress.steps.medium },
                    { icon: <FileText className="w-4 h-4" />, label: t.pages.compress.steps.extreme },
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
              <div className="flex-1 p-4 sm:p-8 flex items-center justify-center">
                <div className="card overflow-hidden max-w-[220px] w-full">
                  <PdfPreview file={file} pageNumber={1} />
                  <div className="p-3 border-t border-[var(--border)]">
                    <p className="text-xs font-semibold text-[var(--text)] truncate">{file.name}</p>
                    <p className="text-[11px] text-[var(--text-subtle)]">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              </div>

              <div className="sidebar">
                <div className="sidebar-header">
                  <h2 className="font-bold text-[var(--text)] text-lg">{t.pages.compress.title}</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.pages.compress.chooseLevel}</p>
                </div>
                <div className="sidebar-body">
                  <div className="space-y-2">
                    {QUALITY_OPTIONS.map(opt => (
                      <label key={opt.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          quality === opt.id ? "border-brand-500 bg-brand-50" : "border-white/35 bg-white/45 backdrop-blur-xl hover:border-brand-200"
                        }`}>
                        <input type="radio" name="quality" value={opt.id} checked={quality === opt.id}
                          onChange={() => setQuality(opt.id)} className="mt-0.5 accent-brand-500 w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-sm font-bold" style={{ color: opt.color }}>{opt.label}</span>
                            <span className="text-xs font-bold" style={{ color: opt.color }}>{opt.size}</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)]">{opt.desc}</p>
                          <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full" style={{ background: opt.color, width: opt.size }} />
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="card p-3 bg-blue-50 border-blue-100">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      {t.pages.compress.hint}
                    </p>
                  </div>
                </div>
                <div className="sidebar-footer space-y-2">
                  <Button onClick={handleCompress} loading={processing} fullWidth size="lg"
                    icon={<FileText className="w-5 h-5" />}>
                    {processing ? t.common.actions.processing : t.pages.compress.title}
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
