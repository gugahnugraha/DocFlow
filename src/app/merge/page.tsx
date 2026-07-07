"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileType, FilePlus, Loader2 } from "lucide-react";

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/merge", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gagal merge PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
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
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <a href="/" className="text-slate-600 hover:text-slate-900">← Kembali</a>
          <div className="flex items-center gap-2">
            <FileType className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-bold text-slate-900">Merge PDF</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {files.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-primary-50 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FilePlus className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Pilih file PDF</h2>
            <p className="text-slate-600 mb-8">Gabungkan beberapa file PDF menjadi satu dokumen</p>
            
            <label className="inline-block cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))}
                className="hidden"
              />
              <div className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto">
                <Upload className="w-5 h-5" />
                Pilih File PDF
              </div>
            </label>
          </div>
        ) : (
          <div>
            <div className="space-y-3 mb-8">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <FileType className="w-8 h-8 text-primary-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-slate-300 hover:border-primary-400 px-6 py-3 rounded-xl font-medium text-slate-600 hover:text-primary-600 transition-colors flex items-center gap-2">
                  <FilePlus className="w-5 h-5" />
                  Tambah File
                </div>
              </label>

              <button
                onClick={handleMerge}
                disabled={isProcessing}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ml-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Merge PDF"
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
