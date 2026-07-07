"use client";

import { useState, useCallback } from "react";
import { FileText } from "lucide-react";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";
import PdfPreview from "@/components/PdfPreview";

const QUALITY_OPTIONS = [
  { id: "recommended", label: "Direkomendasikan", desc: "Kualitas bagus, kompresi terbaik", color: "#059669", bg: "#ecfdf5", size: "~74%" },
  { id: "low",         label: "Sedang",           desc: "Kualitas cukup, kompresi tinggi",  color: "#0284c7", bg: "#e0f2fe", size: "~60%" },
  { id: "extreme",     label: "Maksimal",          desc: "Kualitas minimal, ukuran terkecil", color: "#e64809", bg: "#fff2ee", size: "~88%" },
] as const;

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [quality, setQuality] = useState<typeof QUALITY_OPTIONS[number]["id"]>("recommended");

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
    } catch { alert("Gagal memproses file"); }
    finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Header activePath="/compress" />
      <main className="flex min-h-[calc(100vh-60px)]">
        {!file ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#fffbeb" }}>
                  <FileText className="w-7 h-7" style={{ color: "#d97706" }} />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Compress PDF</h1>
                <p className="text-sm text-[var(--text-muted)]">Perkecil ukuran file PDF tanpa kehilangan kualitas</p>
              </div>
              <DropZone onFiles={loadFile} accept="application/pdf" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 p-8 flex items-center justify-center">
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
                <h2 className="font-bold text-[var(--text)] text-lg">Compress PDF</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Pilih level kompresi</p>
              </div>
              <div className="sidebar-body">
                <div className="space-y-2">
                  {QUALITY_OPTIONS.map(opt => (
                    <label key={opt.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        quality === opt.id ? "border-brand-500 bg-brand-50" : "border-[var(--border)] bg-white hover:border-brand-200"
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
                    Kompresi tidak akan mengubah konten dokumen, hanya mengoptimalkan struktur file.
                  </p>
                </div>
              </div>
              <div className="sidebar-footer space-y-2">
                <Button onClick={handleCompress} loading={processing} fullWidth size="lg"
                  icon={<FileText className="w-5 h-5" />}>
                  {processing ? "Memproses…" : "Compress PDF"}
                </Button>
                <Button onClick={() => setFile(null)} variant="ghost" fullWidth size="sm">
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
