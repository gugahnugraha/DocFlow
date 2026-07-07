"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, FileType, X, Plus } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Setup worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface FileWithId {
  id: string;
  file: File;
}

// Component for individual file preview
function FilePreview({ fileItem, onRemove }: { fileItem: FileWithId, onRemove: (id: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load preview when component mounts
  useEffect(() => {
    let isSubscribed = true;

    const loadPreview = async () => {
      try {
        if (!canvasRef.current) return;

        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(fileItem.file);
        });

        if (!isSubscribed) return;

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (!isSubscribed) {
          pdf.destroy();
          return;
        }

        const page = await pdf.getPage(1);
        if (!isSubscribed) {
          pdf.destroy();
          return;
        }

        const scale = 0.75;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        renderTaskRef.current = page.render({ canvasContext: context, viewport });
        await renderTaskRef.current.promise;

        if (!isSubscribed) {
          pdf.destroy();
          return;
        }

        setIsLoading(false);
        pdf.destroy();
      } catch (err) {
        if (isSubscribed) {
          console.error(`Failed to load preview:`, err);
          setIsLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      isSubscribed = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [fileItem]);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden relative">
      <button
        onClick={() => onRemove(fileItem.id)}
        className="absolute top-2 right-2 w-7 h-7 bg-slate-700 hover:bg-slate-800 text-white rounded-full flex items-center justify-center z-10 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
      <div className="relative aspect-[3/4]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <div className="w-5 h-5 border-3 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
          style={{ display: isLoading ? "none" : "block" }}
        />
      </div>
      <div className="px-3 pb-3 pt-2">
        <p className="text-xs text-slate-700 truncate font-medium">{fileItem.file.name}</p>
      </div>
    </div>
  );
}

export default function MergePage() {
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((newFiles: File[]) => {
    const filesWithId: FileWithId[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
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
      files.forEach((fileItem) => formData.append("files", fileItem.file));

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
                {files.map((fileItem) => (
                  <FilePreview
                    key={fileItem.id}
                    fileItem={fileItem}
                    onRemove={removeFile}
                  />
                ))}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-red-400 hover:bg-red-50 transition-colors aspect-[3/4]">
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
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
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
