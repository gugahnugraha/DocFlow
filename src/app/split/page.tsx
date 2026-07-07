"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, FileType, Loader2, Plus, MoveVertical } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import Header from "@/components/Header";

// Setup worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PageData {
  number: number;
  selected: boolean;
  previewUrl?: string;
}

interface RangeData {
  from: number;
  to: number;
}

// Simple component for previewing individual page
function PdfPagePreview({ 
  file, 
  pageNumber, 
  small = false, 
  selected = false, 
  onToggleSelect 
}: {
  file: File,
  pageNumber: number,
  small?: boolean,
  selected?: boolean,
  onToggleSelect?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load preview when component mounts
  useEffect(() => {
    if (!file) return;

    let isSubscribed = true;
    let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;

    const loadPreview = async () => {
      try {
        // Read file
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });

        if (!isSubscribed) return;

        pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (!isSubscribed) {
          pdfDoc.destroy();
          return;
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (!isSubscribed) {
          pdfDoc.destroy();
          return;
        }

        const scale = small ? 0.5 : 0.75;
        const viewport = page.getViewport({ scale });
        
        // Wait for canvas to be ready
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        renderTaskRef.current = page.render({ canvasContext: context, viewport });
        await renderTaskRef.current.promise;

        if (!isSubscribed) {
          if (pdfDoc) pdfDoc.destroy();
          return;
        }

        setIsLoading(false);
        if (pdfDoc) pdfDoc.destroy();
      } catch (err) {
        if (isSubscribed) {
          console.error(`Failed to load page ${pageNumber}:`, err);
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
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [file, pageNumber, small]);

  return (
    <div 
      className={`relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer ${
        small ? 'w-32' : ''
      } ${selected ? 'ring-2 ring-green-500 ring-offset-2' : 'hover:ring-2 hover:ring-slate-300 hover:ring-offset-2'}`}
      onClick={onToggleSelect}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <div className="w-5 h-5 border-3 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
        </div>
      )}
      {onToggleSelect && (
        <div className="absolute top-3 left-3 z-20">
          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            selected ? 'bg-green-500 border-green-500' : 'bg-white border-slate-300 hover:border-slate-400'
          }`}>
            {selected && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
      <div className="bg-white py-2 text-center border-t border-slate-200">
        <span className="text-sm font-medium text-slate-700">{pageNumber}</span>
      </div>
    </div>
  );
}

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pages, setPages] = useState<PageData[]>([]);
  const [splitMode, setSplitMode] = useState<"range" | "pages" | "size">("range");
  const [rangeMode, setRangeMode] = useState<"custom" | "fixed" | "smart">("custom");
  const [ranges, setRanges] = useState<RangeData[]>([{ from: 1, to: 1 }]);
  const [mergeAll, setMergeAll] = useState(false);
  
  // Pages mode specific state
  const [extractMode, setExtractMode] = useState<"all" | "select">("select");
  const [pagesToExtract, setPagesToExtract] = useState("");

  const onDrop = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    
    // Read file to get total pages
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(selectedFile);
    });

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    pdf.destroy();
    
    const newPages: PageData[] = [];
    for (let i = 1; i <= totalPages; i++) {
      newPages.push({ number: i, selected: true });
    }
    setPages(newPages);
    
    // Set initial range
    setRanges([{ from: 1, to: totalPages }]);
    
    // Set initial pages to extract
    setPagesToExtract(`1-${totalPages}`);
  }, []);

  const togglePage = useCallback((pageNum: number) => {
    setPages(prev => prev.map(p => 
      p.number === pageNum ? { ...p, selected: !p.selected } : p
    ));
  }, []);

  const addRange = () => {
    const lastRange = ranges[ranges.length - 1];
    const newFrom = lastRange.to + 1;
    const newTo = Math.min(newFrom, pages.length);
    if (newFrom <= pages.length) {
      setRanges([...ranges, { from: newFrom, to: newTo }]);
    }
  };

  const updateRange = (index: number, field: "from" | "to", value: number) => {
    const newRanges = [...ranges];
    newRanges[index][field] = Math.max(1, Math.min(value, pages.length));
    setRanges(newRanges);
  };

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      if (splitMode === "pages") {
        formData.append("extractMode", extractMode);
        formData.append("pagesToExtract", JSON.stringify(
          extractMode === "select" ? pages.filter(p => p.selected).map(p => p.number) : "all"
        ));
      } else {
        formData.append("ranges", JSON.stringify(ranges));
      }
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

  // Calculate how many PDFs will be created
  const selectedPagesCount = pages.filter(p => p.selected).length;
  const pdfsToCreate = splitMode === "pages"
    ? (mergeAll ? 1 : selectedPagesCount)
    : (mergeAll ? 1 : ranges.length);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header activePath="/split" />

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
            <div className="flex-1 p-6 overflow-y-auto">
              {splitMode === "range" ? (
                // Visualisasi ranges (seperti ilovePDF)
                <div className="flex flex-col items-center gap-8">
                  {ranges.map((range, index) => (
                    <div key={index} className="flex flex-col items-center gap-4">
                      <div className="text-lg font-semibold text-slate-700">Range {index + 1}</div>
                      <div className="flex items-center gap-4 p-6 border-2 border-dashed border-slate-300 rounded-xl bg-white">
                        {/* Preview first page of range */}
                        {file && range.from <= pages.length && (
                          <PdfPagePreview file={file} pageNumber={range.from} small />
                        )}
                        
                        {/* Dots separator if more than 1 page */}
                        {range.to > range.from && (
                          <div className="text-slate-400 text-xl font-bold">• • •</div>
                        )}
                        
                        {/* Preview last page of range if different from first */}
                        {file && range.to > range.from && range.to <= pages.length && (
                          <PdfPagePreview file={file} pageNumber={range.to} small />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : splitMode === "pages" ? (
                // Visualisasi semua halaman (untuk mode Pages)
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {pages.map((page) => (
                    <PdfPagePreview
                      key={page.number}
                      file={file}
                      pageNumber={page.number}
                      selected={page.selected}
                      onToggleSelect={extractMode === "select" ? () => togglePage(page.number) : undefined}
                    />
                  ))}
                </div>
              ) : (
                // Placeholder untuk mode Size
                <div className="flex items-center justify-center h-full">
                  <div className="text-slate-500 text-lg">Size mode will be available soon</div>
                </div>
              )}
            </div>

            <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Split PDF</h2>
              
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

                {splitMode === "pages" && (
                  <>
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Extract mode:</h3>
                    <div className="flex gap-3 mb-6">
                      {(["all", "select"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setExtractMode(mode);
                            if (mode === "all") {
                              setPages(prev => prev.map(p => ({ ...p, selected: true })));
                            }
                          }}
                          className={`flex-1 py-2 px-3 border-2 rounded-xl font-semibold transition-all ${
                            extractMode === mode
                              ? "border-red-500 text-red-600 bg-red-50"
                              : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <span className="capitalize">
                            {mode === "all" ? "Extract all pages" : "Select pages"}
                          </span>
                        </button>
                      ))}
                    </div>

                    {extractMode === "select" && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Pages to extract:</label>
                        <input
                          type="text"
                          placeholder="example: 1,5-8"
                          value={pagesToExtract}
                          onChange={(e) => setPagesToExtract(e.target.value)}
                          className="w-full px-3 py-3 border border-slate-300 rounded-lg text-slate-700"
                        />
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
                    <span className="text-slate-700">
                      {splitMode === "pages"
                        ? "Merge extracted pages into one PDF file."
                        : "Merge all ranges into one PDF file."
                      }
                    </span>
                  </label>
                  
                  {/* Info box about PDFs to create */}
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-700">
                        {splitMode === "pages" ? "Selected pages will be converted into" : "Selected ranges will be converted into"} separate PDF files. <span className="font-bold text-black">{pdfsToCreate} PDF</span> will be created.
                      </p>
                    </div>
                  </div>
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
