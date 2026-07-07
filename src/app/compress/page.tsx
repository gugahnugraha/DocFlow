"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileType, FilePlus, Loader2, FileText } from "lucide-react";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState<string>("medium");

  const onDrop = useCallback((acceptedFile: File) => {
    setFile(acceptedFile);
  }, []);

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("quality", quality);

      const response = await fetch("/api/compress", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gagal compress PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Gagal memproses file");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <a href="/" className="text-slate-600 hover:text-slate-900">← Kembali</a>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900">Compress PDF</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {!file ? (
          <div className="text-center py-20">
            <div className="bg-amber-50 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FilePlus className="w-12 h-12 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Pilih file PDF</h2>
            <p className="text-slate-600 mb-8">Perkecil ukuran file PDF tanpa mengorbankan kualitas</p>
            
            <label className="inline-block cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => e.target.files && onDrop(e.target.files[0])}
                className="hidden"
              />
              <div className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto">
                <Upload className="w-5 h-5" />
                Pilih File PDF
              </div>
            </label>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-8">
              <FileType className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-4">
                Kualitas Kompresi
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "low", label: "Kecil", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", activeBorder: "border-emerald-500", activeBg: "bg-emerald-100" },
                  { value: "medium", label: "Sedang", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", activeBorder: "border-amber-500", activeBg: "bg-amber-100" },
                  { value: "high", label: "Besar", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", activeBorder: "border-red-500", activeBg: "bg-red-100" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setQuality(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      quality === option.value 
                        ? `${option.activeBorder} ${option.activeBg}` 
                        : `${option.border} ${option.bg} hover:border-slate-300`
                    }`}
                  >
                    <p className={`font-semibold ${option.color}`}>{option.label}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {option.value === "low" ? "Ukuran terkecil" : option.value === "medium" ? "Keseimbangan" : "Kualitas terbaik"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => e.target.files && onDrop(e.target.files[0])}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-slate-300 hover:border-amber-400 px-6 py-3 rounded-xl font-medium text-slate-600 hover:text-amber-600 transition-colors flex items-center gap-2">
                  <FilePlus className="w-5 h-5" />
                  Ganti File
                </div>
              </label>

              <button
                onClick={handleCompress}
                disabled={isProcessing}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ml-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Compress PDF"
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
