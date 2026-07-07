"use client";

import { useState, useCallback } from "react";
import { Upload, FileType } from "lucide-react";
import PdfPreview from "@/components/PdfPreview";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState<"recommended" | "low" | "extreme">("recommended");

  const onDrop = useCallback((selectedFile: File) => {
    setFile(selectedFile);
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
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 text-2xl font-bold">
              <span className="text-black">Doc</span>
              <span className="text-red-600">Flow</span>
            </a>
            <div className="hidden md:flex items-center gap-6 ml-8">
              <a href="/merge" className="text-slate-700 font-semibold hover:text-slate-900">Merge PDF</a>
              <a href="/split" className="text-slate-700 font-semibold hover:text-slate-900">Split PDF</a>
              <a href="/compress" className="text-red-600 font-semibold border-b-2 border-red-600 pb-1">Compress PDF</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-slate-700 font-semibold hover:text-slate-900">Login</button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors">Sign up</button>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-4rem)]">
        {!file ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white rounded-2xl p-10 shadow-sm max-w-md w-full">
                <div className="bg-red-50 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <FileType className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Pilih file PDF</h2>
                <p className="text-slate-500 mb-8">Perkecil ukuran file PDF tanpa mengorbankan kualitas</p>
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => e.target.files && onDrop(e.target.files[0])}
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
            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-xs">
                <PdfPreview file={file} pageNumber={1} />
                <div className="px-3 pb-3">
                  <p className="text-xs text-slate-700 truncate font-medium">{file.name}</p>
                </div>
              </div>
            </div>

            <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Compress PDF</h2>
              
              <div className="flex-1">
                <div className="space-y-4 mb-6">
                  {[
                    { id: "recommended", label: "Recommended", desc: "Good quality and great compression", color: "green", size: "~26%" },
                    { id: "low", label: "Medium", desc: "Good quality and good compression", color: "blue", size: "~40%" },
                    { id: "extreme", label: "Extreme", desc: "Less quality and best compression", color: "red", size: "~12%" },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className={`block cursor-pointer rounded-xl border-2 p-4 transition-all ${
                        quality === option.id
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`font-bold text-lg ${
                          option.id === "recommended" ? "text-green-600" : option.id === "low" ? "text-blue-600" : "text-red-600"
                        }`}>
                          {option.label}
                        </span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          quality === option.id ? "border-red-600 bg-white" : "border-slate-300"
                        }`}>
                          {quality === option.id && (
                            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{option.desc}</p>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              option.id === "recommended" ? "bg-green-500" : option.id === "low" ? "bg-blue-500" : "bg-red-500"
                            }`}
                            style={{ width: option.size }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{option.size}</span>
                      </div>
                    </label>
                  ))}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-700">
                      Reduce the size of your PDF documents without affecting the quality of your files, <span className="font-semibold">100% free!</span>
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCompress}
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-xl transition-colors flex items-center justify-center gap-3 shadow-lg mt-6"
              >
                {isProcessing ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    Compress PDF
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
