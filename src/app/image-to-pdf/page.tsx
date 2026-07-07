"use client";

import { useState, useCallback } from "react";
import { ImageIcon, X, GripVertical, Plus } from "lucide-react";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";

interface ImageItem { id: string; file: File; previewUrl: string }

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragSrc, setDragSrc] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState(20);
  const [fitMode, setFitMode] = useState<"contain" | "stretch" | "original">("contain");

  const addImages = useCallback((files: File[]) => {
    const valid = files.filter(f => ["image/jpeg","image/jpg","image/png","image/webp"].includes(f.type));
    setImages(prev => [...prev, ...valid.map(f => ({ id: crypto.randomUUID(), file: f, previewUrl: URL.createObjectURL(f) }))]);
  }, []);

  const remove = (id: string) => {
    setImages(prev => { const img = prev.find(i => i.id === id); if (img) URL.revokeObjectURL(img.previewUrl); return prev.filter(i => i.id !== id); });
  };

  const onDrop = (dropId: string) => {
    if (!dragSrc || dragSrc === dropId) return;
    setImages(prev => { const next = [...prev]; const fi = next.findIndex(i => i.id === dragSrc); const ti = next.findIndex(i => i.id === dropId); const [m] = next.splice(fi, 1); next.splice(ti, 0, m); return next; });
    setDragSrc(null); setDragOver(null);
  };

  const handleConvert = async () => {
    if (!images.length) return;
    setProcessing(true);
    try {
      const fd = new FormData();
      images.forEach(img => fd.append("files", img.file));
      fd.append("pageSize", pageSize); fd.append("orientation", orientation);
      fd.append("margin", String(margin)); fd.append("fitMode", fitMode);
      const res = await fetch("/api/image-to-pdf", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "images.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) { alert(err.message || "Gagal memproses file"); }
    finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Header activePath="/image-to-pdf" />
      <main className="flex min-h-[calc(100vh-60px)]">
        {images.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-brand-50">
                  <ImageIcon className="w-7 h-7 text-brand-500" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Gambar ke PDF</h1>
                <p className="text-sm text-[var(--text-muted)]">Konversi JPG, PNG menjadi satu dokumen PDF</p>
              </div>
              <DropZone onFiles={addImages} accept="image/jpeg,image/jpg,image/png,image/webp" multiple
                label="Letakkan gambar di sini" sublabel="JPG, PNG, WebP — pilih beberapa sekaligus" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {images.map(img => (
                  <div key={img.id} draggable
                    onDragStart={() => setDragSrc(img.id)} onDragEnter={() => setDragOver(img.id)}
                    onDragEnd={() => { setDragSrc(null); setDragOver(null); }}
                    onDragOver={e => e.preventDefault()} onDrop={() => onDrop(img.id)}
                    className={`relative bg-white rounded-xl border-2 overflow-hidden cursor-grab active:cursor-grabbing transition-all ${dragSrc === img.id ? "opacity-40 scale-95 border-[var(--border)]" : dragOver === img.id ? "border-brand-500 scale-105 shadow-[0_0_0_3px_rgba(230,72,9,.12)]" : "border-[var(--border)] hover:border-brand-200"}`}>
                    <div className="absolute top-1.5 left-1.5 z-10 text-[var(--text-subtle)]"><GripVertical className="w-3.5 h-3.5" /></div>
                    <button onClick={() => remove(img.id)} className="absolute top-1.5 right-1.5 z-10 w-5 h-5 bg-white border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--text-subtle)] hover:text-red-500 transition-colors shadow-sm"><X className="w-3 h-3" /></button>
                    <div className="aspect-[3/4] overflow-hidden bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.previewUrl} alt={img.file.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="px-2 py-1 border-t border-[var(--border)]">
                      <p className="text-[10px] text-[var(--text-subtle)] truncate">{img.file.name}</p>
                    </div>
                  </div>
                ))}
                <label className="cursor-pointer">
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple onChange={e => e.target.files && addImages(Array.from(e.target.files))} className="hidden" />
                  <div className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border-2 border-dashed border-[var(--border)] hover:border-brand-300 hover:bg-brand-50/30 transition-colors text-[var(--text-subtle)] gap-2">
                    <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center"><Plus className="w-4 h-4 text-white" /></div>
                    <span className="text-xs font-semibold">Tambah</span>
                  </div>
                </label>
              </div>
              <p className="text-center text-xs text-[var(--text-subtle)] mt-4">Seret gambar untuk mengubah urutan halaman PDF</p>
            </div>
            <div className="sidebar">
              <div className="sidebar-header"><h2 className="font-bold text-[var(--text)] text-lg">Gambar ke PDF</h2></div>
              <div className="sidebar-body">
                <div>
                  <label className="label">Ukuran Halaman</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["A4","A3","Letter","Legal","fit"].map(s => (
                      <button key={s} onClick={() => setPageSize(s)}
                        className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${pageSize === s ? "border-brand-500 bg-brand-50 text-brand-600" : "border-[var(--border)] text-[var(--text-muted)] hover:border-brand-200"}`}>
                        {s === "fit" ? "Fit" : s}
                      </button>
                    ))}
                  </div>
                </div>
                {pageSize !== "fit" && (
                  <div>
                    <label className="label">Orientasi</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["portrait","landscape"] as const).map(o => (
                        <button key={o} onClick={() => setOrientation(o)}
                          className={`py-2.5 text-xs font-semibold rounded-xl border-2 transition-all ${orientation === o ? "border-brand-500 bg-brand-50 text-brand-600" : "border-[var(--border)] text-[var(--text-muted)] hover:border-brand-200"}`}>
                          {o === "portrait" ? "↕ Portrait" : "↔ Landscape"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="label">Mode Gambar</label>
                  <div className="space-y-1.5">
                    {[{ id: "contain", l: "Contain", d: "Pertahankan rasio, tambah margin" }, { id: "stretch", l: "Stretch", d: "Isi seluruh halaman" }, { id: "original", l: "Original", d: "Ukuran asli gambar" }].map(m => (
                      <label key={m.id} className={`flex items-start gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${fitMode === m.id ? "border-brand-500 bg-brand-50" : "border-[var(--border)] hover:border-brand-200"}`}>
                        <input type="radio" name="fitMode" value={m.id} checked={fitMode === m.id} onChange={() => setFitMode(m.id as any)} className="mt-0.5 accent-brand-500" />
                        <div><p className="text-xs font-semibold text-[var(--text)]">{m.l}</p><p className="text-[11px] text-[var(--text-subtle)]">{m.d}</p></div>
                      </label>
                    ))}
                  </div>
                </div>
                {pageSize !== "fit" && (
                  <div>
                    <label className="label">Margin: <span className="text-brand-500">{margin}px</span></label>
                    <input type="range" min={0} max={80} value={margin} onChange={e => setMargin(+e.target.value)} className="w-full accent-brand-500" />
                  </div>
                )}
              </div>
              <div className="sidebar-footer space-y-2">
                <Button onClick={handleConvert} loading={processing} disabled={images.length === 0} fullWidth size="lg" icon={<ImageIcon className="w-5 h-5"/>}>
                  {processing ? "Mengkonversi…" : "Konversi ke PDF"}
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
