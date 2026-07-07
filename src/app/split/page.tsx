"use client";

import { useState, useCallback } from "react";
import { Upload, FileType, Loader2, Scissors, Plus, MoveVertical } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PageData {
  number: number;
  selected: boolean;
}

interface RangeData {
  from: number;
  to: number;
}

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pages, setPages] = useState<PageData[]>([]);
  const [splitMode, setSplitMode] = useState<"range" | "pages" | "size">("range");
  const [rangeMode, setRangeMode] = useState<"custom" | "fixed" | "smart">("custom");
  const [ranges, setRanges] = useState<RangeData[]>([{ from: 1, to: 1 }]);
  const [mergeAll, setMergeAll] = useState(false);

  const onDrop = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    
    // Load PDF to get total pages
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    
    const newPages: PageData[] = [];
    for (let i = 1; i <= totalPages; i++) {
      newPages.push({ number: i, selected: true });
    }
    setPages(newPages);
    
    // Set initial range
    setRanges([{ from: 1, to: totalPages }]);
  }, []);

  const addRange = () => {
    const lastRange = ranges[ranges.length - 1];
    const newFrom = lastRange.to + 1;
    const newTo = Math.min(newFrom, pages.length);
    setRanges([...ranges, { from: newFrom, to: newTo }]);
  };

  const updateRange = (index: number, field: "from" | "to", value: number) => {
    const newRanges = [...ranges];
    newRanges[index][field] = value;
    setRanges(newRanges);
  };

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ranges", JSON.stringify(ranges));
      formData.append("mergeAll", mergeAll.toString());

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
      a.download = mergeAll ? "split.pdf" : "split.zip";
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
              <a href="/split" className="text-red-600 font-semibold border-b-2 border-red-600 pb-1">Split PDF</a>
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
        {!file ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white rounded-2xl p-10 shadow-sm max-w-md w-full">
                <div className="bg-red-50 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <FileType className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Pilih file PDF</h2>
                <p className="text-slate-500 mb-8">Pisahkan file PDF menjadi beberapa dokumen</p>
                
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
            <div className="flex-1 p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {pages.map((page) => (
                  <div
                    key={page.number}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                      page.selected ? "border-green-500" : "border-transparent hover:border-slate-300"
                    }`}
                    onClick={() => setPages(prev => prev.map(p => p.number === page.number ? { ...p, selected: !p.selected } : p))}
                  >
                    {page.selected && (
                      <div className="absolute top-2 left-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center z-10 shadow-md">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="aspect-[3/4] bg-white p-3">
                      <div className="w-full h-full border border-slate-200 rounded flex items-center justify-center bg-slate-50">
                        <span className="text-4xl font-light text-slate-400">{page.number}</span>
                      </div>
                    </div>
                    <div className="bg-white py-2 text-center">
                      <span className="text-sm font-medium text-slate-700">{page.number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Split</h2>
              
              <div className="flex mb-6 border-b border-slate-200">
                {([
                  { id: "range", icon: "range" },
                  { id: "pages", icon: "pages" },
                  { id: "size", icon: "size" }
                ] as const).map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSplitMode(mode.id)}
                    className={`flex-1 py-3 text-center font-medium transition-colors relative ${
                      splitMode === mode.id ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {mode.id === "range" && (
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18M9 21V9" />
                        </svg>
                      )}
                      {mode.id === "pages" && (
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <path d="M9 15h1M9 10h1M14 15h1M14 10h1M5 4v.01M19 4v.01M5 20v.01M19 20v.01" />
                        </svg>
                      )}
                      {mode.id === "size" && (
                        <>
                          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                          </svg>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                        </>
                      )}
                      <span className="capitalize">{mode.id}</span>
                    </div>
                    {splitMode === mode.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="flex-1">
                {splitMode === "range" && (
                  <>
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Range mode:</h3>
                    <div className="flex gap-3 mb-6">
                      {(["custom", "fixed", "smart"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setRangeMode(mode)}
                          className={`flex-1 py-2 px-3 border-2 rounded-xl font-semibold transition-all ${
                            rangeMode === mode
                              ? "border-red-500 text-red-600 bg-red-50"
                              : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <span className="capitalize">{mode}</span>
                          {mode === "smart" && <span className="ml-1">✦</span>}
                        </button>
                      ))}
                    </div>

                    {rangeMode === "custom" && (
                      <div className="space-y-4">
                        {ranges.map((range, index) => (
                          <div key={index}>
                            <div className="flex items-center gap-2 mb-2">
                              <MoveVertical className="w-4 h-4 text-slate-500" />
                              <span className="text-sm font-semibold text-slate-700">Range {index + 1}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">from page</label>
                                <input
                                  type="number"
                                  value={range.from}
                                  onChange={(e) => updateRange(index, "from", parseInt(e.target.value) || 1)}
                                  min={1}
                                  max={pages.length}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">to</label>
                                <input
                                  type="number"
                                  value={range.to}
                                  onChange={(e) => updateRange(index, "to", parseInt(e.target.value) || 1)}
                                  min={1}
                                  max={pages.length}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={addRange}
                          className="w-full flex items-center justify-center gap-2 border-2 border-red-500 text-red-600 py-2 px-4 rounded-xl font-bold hover:bg-red-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Range
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mergeAll}
                      onChange={(e) => setMergeAll(e.target.checked)}
                      className="w-5 h-5 border-2 border-slate-300 rounded"
                    />
                    <span className="text-slate-700">Merge all ranges in one PDF file.</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleSplit}
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-xl transition-colors flex items-center justify-center gap-3 shadow-lg mt-6"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Split PDF
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
