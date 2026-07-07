"use client";

import { useState, useCallback } from "react";
import { Upload, Loader2, ImageIcon, X, GripVertical, Plus } from "lucide-react";
import Header from "@/components/Header";

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Settings
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState(20);
  const [fitMode, setFitMode] = useState<"contain" | "stretch" | "original">("contain");

  const addImages = useCallback((files: File[]) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const valid = files.filter(f => validTypes.includes(f.type));
    const items: ImageItem[] = valid.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setImages(prev => [...prev, ...items]);
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(i => i.id !== id);
    });
  };

  // Drag reorder
  const handleDrop = (dropId: string) => {
    if (!dragSourceId || dragSourceId === dropId) return;
    setImages(prev => {
      const next = [...prev];
      const fromIdx = next.findIndex(i => i.id === dragSourceId);
      const toIdx = next.findIndex(i => i.id === dropId);
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setDragSourceId(null);
    setDragOverId(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      images.forEach(img => formData.append("files", img.file));
      formData.append("pageSize", pageSize);
      formData.append("orientation", orientation);
      formData.append("margin", margin.toString());
      formData.append("fitMode", fitMode);

      const res = await fetch("/api/image-to-pdf", { method: "POST", body: formData });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Gagal memproses file");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-black">Doc</span><span className="text-red-600">Flow</span>
          </a>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-slate-700 font-semibold hover:text-slate-900">Login</button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors">Sign up</button>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-4rem)]">
        {images.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-10 shadow-sm max-w-md w-full text-center">
              <div className="bg-orange-50 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-10 h-10 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Gambar ke PDF</h2>
              <p className="text-slate-500 mb-8">Konversi JPG, PNG ke PDF. Pilih beberapa gambar sekaligus.</p>
              <label className="cursor-pointer">
                <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" multiple
                  onChange={(e) => e.target.files && addImages(Array.from(e.target.files))} className="hidden" />
                <div className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3">
                  <Upload className="w-6 h-6" /> Pilih Gambar
                </div>
              </label>
              <p className="text-xs text-slate-400 mt-4">JPG, PNG, WebP — hingga beberapa file sekaligus</p>
            </div>
          </div>
        ) : (
          <>
            {/* Image grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => setDragSourceId(img.id)}
                    onDragEnter={() => setDragOverId(img.id)}
                    onDragEnd={() => { setDragSourceId(null); setDragOverId(null); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(img.id)}
                    className={`relative bg-white rounded-xl shadow-sm border-2 overflow-hidden cursor-grab active:cursor-grabbing transition-all ${
                      dragSourceId === img.id
                        ? "opacity-40 scale-95 border-slate-300"
                        : dragOverId === img.id
                        ? "border-red-500 ring-2 ring-red-200 scale-105"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Drag handle */}
                    <div className="absolute top-2 left-2 z-10 text-slate-400">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    {/* Remove button */}
                    <button onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 z-10 w-6 h-6 bg-slate-700 hover:bg-slate-900 text-white rounded-full flex items-center justify-center transition-colors">
                      <X className="w-3 h-3" />
                    </button>

                    <div className="aspect-[3/4] overflow-hidden bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.previewUrl} alt={img.file.name}
                        className="w-full h-full object-contain" />
                    </div>
                    <div className="px-2 py-1.5 border-t border-slate-100">
                      <p className="text-xs text-slate-600 truncate font-medium">{img.file.name}</p>
                    </div>
                  </div>
                ))}

                {/* Add more */}
                <label className="cursor-pointer">
                  <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" multiple
                    onChange={(e) => e.target.files && addImages(Array.from(e.target.files))} className="hidden" />
                  <div className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-red-400 hover:bg-red-50 transition-colors aspect-[3/4] cursor-pointer">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mb-2">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">Tambah gambar</span>
                  </div>
                </label>
              </div>
              <p className="text-center text-sm text-slate-400 mt-6">Seret gambar untuk mengubah urutannya di PDF</p>
            </div>

            {/* Settings sidebar */}
            <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Gambar ke PDF</h2>

              <div className="space-y-5 flex-1">
                {/* Page size */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ukuran Halaman</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["A4", "A3", "Letter", "Legal", "fit"].map((s) => (
                      <button key={s} onClick={() => setPageSize(s)}
                        className={`py-2 text-sm font-semibold rounded-lg border-2 transition-all ${
                          pageSize === s
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}>
                        {s === "fit" ? "Fit" : s}
                      </button>
                    ))}
                  </div>
                  {pageSize === "fit" && (
                    <p className="text-xs text-slate-400 mt-1">Halaman mengikuti ukuran gambar</p>
                  )}
                </div>

                {/* Orientation (only when not fit) */}
                {pageSize !== "fit" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Orientasi</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["portrait", "landscape"] as const).map((o) => (
                        <button key={o} onClick={() => setOrientation(o)}
                          className={`py-2.5 text-sm font-semibold rounded-xl border-2 transition-all flex items-center justify-center gap-1.5 ${
                            orientation === o
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}>
                          {o === "portrait" ? "↕ Portrait" : "↔ Landscape"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fit mode */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mode Gambar</label>
                  <div className="space-y-2">
                    {[
                      { id: "contain",  label: "Contain", desc: "Pertahankan rasio, tambah margin" },
                      { id: "stretch",  label: "Stretch", desc: "Isi seluruh halaman" },
                      { id: "original", label: "Original", desc: "Ukuran asli gambar" },
                    ].map((m) => (
                      <label key={m.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          fitMode === m.id
                            ? "border-red-500 bg-red-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}>
                        <input type="radio" name="fitMode" value={m.id}
                          checked={fitMode === m.id} onChange={() => setFitMode(m.id as any)}
                          className="mt-0.5 accent-red-600" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{m.label}</p>
                          <p className="text-xs text-slate-500">{m.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Margin */}
                {pageSize !== "fit" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Margin: <span className="text-red-600">{margin}px</span>
                    </label>
                    <input type="range" min={0} max={80} value={margin}
                      onChange={(e) => setMargin(parseInt(e.target.value))}
                      className="w-full accent-red-600" />
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">{images.length} gambar</span> akan digabung menjadi 1 file PDF.
                    Seret gambar untuk mengubah urutan halaman.
                  </p>
                </div>
              </div>

              <button
                onClick={handleConvert}
                disabled={isProcessing || images.length === 0}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 shadow-lg mt-6"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Mengkonversi...</>
                ) : (
                  <><ImageIcon className="w-5 h-5" /> Konversi ke PDF</>
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
