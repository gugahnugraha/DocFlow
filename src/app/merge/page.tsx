"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, FilePlus, Loader2, FileType, X, Plus } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface FileWithPages extends File {
  id: string;
  pages?: { canvas: HTMLCanvasElement; pageNum: number }[];
}

export default function MergePage() {
  const [files, setFiles] = useState<FileWithPages[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((newFiles: File[]) => {
    const filesWithId: FileWithPages[] = newFiles.map((file) => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
    }));
    setFiles((prev) => [...prev, ...filesWithId]);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
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
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 text-2xl font-bold">
              <span className="text-black">Doc</span>
              <span className="text-red-600">Flow</span>
            </a>
            <div className="hidden md:flex items-center gap-6 ml-8">
              <a href="/merge" className="text-red-600 font-semibold border-b-2 border-red-600 pb-1">Merge PDF</a>
              <a href="/split" className="text-slate-700 font-semibold hover:text-slate-900">Split PDF</a>
              <a href="/compress" className="text-slate-700 font-semibold hover:text-slate-900">Compress PDF</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-slate-700 font-semibold hover:text-slate-900">Login</button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors">Sign up</button>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-4rem)]">
        {files.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white rounded-2xl p-10 shadow-sm max-w-md w-full">
                <div className="bg-red-50 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <FileType className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Pilih file PDF</h2>
                <p className="text-slate-500 mb-8">Gabungkan beberapa file PDF menjadi satu dokumen</p>
                
                <label className="cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))}
                    className="hidden"
                  />
                  <div className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3">
                    <Upload className="w-6 h-6" />
                    Pilih File PDF
                  </div>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {files.map((file) => (
                  <div key={file.id} className="bg-white rounded-xl shadow-sm p-3 relative">
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-800 z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="aspect-[3/4] bg-slate-100 rounded-lg mb-2 flex items-center justify-center">
                      <FileType className="w-12 h-12 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-600 truncate font-medium">{file.name}</p>
                  </div>
                ))}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-red-400 hover:bg-red-50 transition-colors aspect-square">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-2">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">Tambah file</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Merge PDF</h2>
              
              <div className="flex-1">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Please, select more PDF files</span> by clicking again on 'Select PDF files'. Select multiple files by maintaining pressed 'Ctrl'.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleMerge}
                disabled={isProcessing || files.length < 2}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-xl transition-colors flex items-center justify-center gap-3 shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Merge PDF
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
