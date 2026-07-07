"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileType, FilePlus, Loader2, Scissors } from "lucide-react";

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitAt, setSplitAt] = useState<string>("");

  const onDrop = useCallback((acceptedFile: File) => {
    setFile(acceptedFile);
  }, []);

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("splitAt", splitAt);

      const response = await fetch("/api/split", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gagal split PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "split.zip";
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
            <Scissors className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Split PDF</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {!file ? (
          <div className="text-center py-20">
            <div className="bg-emerald-50 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FilePlus className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Pilih file PDF</h2>
            <p className="text-slate-600 mb-8">Pisahkan file PDF menjadi beberapa dokumen</p>
            
            <label className="inline-block cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => e.target.files && onDrop(e.target.files[0])}
                className="hidden"
              />
              <div className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto">
                <Upload className="w-5 h-5" />
                Pilih File PDF
              </div>
            </label>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-8">
              <FileType className="w-8 h-8 text-emerald-600 flex-shrink-0" />
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pisahkan pada halaman (contoh: 2,5 untuk memisahkan di halaman 2 dan 5)
              </label>
              <input
                type="text"
                value={splitAt}
                onChange={(e) => setSplitAt(e.target.value)}
                placeholder="2,5"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => e.target.files && onDrop(e.target.files[0])}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-400 px-6 py-3 rounded-xl font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-2">
                  <FilePlus className="w-5 h-5" />
                  Ganti File
                </div>
              </label>

              <button
                onClick={handleSplit}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ml-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Split PDF"
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
