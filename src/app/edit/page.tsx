"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload, Loader2, MousePointer2, Type, Highlighter,
  Pencil, Trash2, Save, ChevronLeft, ChevronRight,
  Bold, Italic, Underline, Square, Circle, Minus,
  ZoomIn, ZoomOut, RotateCcw, Maximize2, CheckCheck,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const copyAB = (b: ArrayBuffer) => {
  const c = new ArrayBuffer(b.byteLength);
  new Uint8Array(c).set(new Uint8Array(b));
  return c;
};

type Tool = "select" | "text" | "highlight" | "draw" | "rectangle" | "circle" | "line";

interface Annotation {
  id: string;
  type: "text" | "highlight" | "draw" | "rectangle" | "circle" | "line";
  page: number;
  x: number; y: number;
  width?: number; height?: number;
  content?: string;
  color: string;
  fontSize?: number;
  bold?: boolean; italic?: boolean; underline?: boolean;
  points?: { x: number; y: number }[];
  fill?: boolean;
  fillColor?: string;
}

/* ─── Thumbnail sidebar item ─────────────────────────────────────────────── */
function PageThumb({
  arrayBuffer, pageNumber, selected, onClick,
}: { arrayBuffer: ArrayBuffer | null; pageNumber: number; selected: boolean; onClick: () => void }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!arrayBuffer) return;
    let alive = true;
    (async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: copyAB(arrayBuffer) }).promise;
        if (!alive) { pdf.destroy(); return; }
        const page = await pdf.getPage(pageNumber);
        if (!alive) { pdf.destroy(); return; }
        const vp = page.getViewport({ scale: 0.28 });
        const c = cvs.current!;
        c.width = vp.width; c.height = vp.height;
        await page.render({ canvasContext: c.getContext("2d")!, viewport: vp }).promise;
        if (alive) setLoading(false);
        pdf.destroy();
      } catch { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [arrayBuffer, pageNumber]);

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-xl overflow-hidden border-2 transition-all duration-150 ${
        selected
          ? "border-brand-500 shadow-[0_0_0_3px_rgba(230,72,9,.15)]"
          : "border-transparent hover:border-[var(--border)]"
      }`}
    >
      <div className="bg-slate-100 flex items-center justify-center min-h-[80px] relative">
        {loading && <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />}
        <canvas ref={cvs} className="w-full h-auto block" style={{ display: loading ? "none" : "block" }} />
      </div>
      <div className={`text-center py-1 text-[11px] font-semibold transition-colors ${
        selected ? "text-brand-600 bg-brand-50" : "text-[var(--text-subtle)] bg-white group-hover:bg-[var(--bg)]"
      }`}>
        {pageNumber}
      </div>
    </button>
  );
}

/* ─── Canvas editor ──────────────────────────────────────────────────────── */
function EditorCanvas({
  arrayBuffer, pageNumber, tool, annotations, onAnnotationsChange,
  selectedId, onSelect, scale, fmt,
}: {
  arrayBuffer: ArrayBuffer | null; pageNumber: number; tool: Tool;
  annotations: Annotation[]; onAnnotationsChange: (a: Annotation[]) => void;
  selectedId: string | null; onSelect: (id: string | null) => void;
  scale: number;
  fmt: { fontSize: number; color: string; bold: boolean; italic: boolean; underline: boolean };
}) {
  const pdfCvs  = useRef<HTMLCanvasElement>(null);
  const drawCvs = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const renderTask = useRef<any>(null);

  const [dims, setDims]           = useState({ w: 0, h: 0 });
  const [drawing, setDrawing]     = useState(false);
  const [pts, setPts]             = useState<{ x: number; y: number }[]>([]);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapeEnd,   setShapeEnd]   = useState<{ x: number; y: number } | null>(null);
  const [textEdit,  setTextEdit]  = useState(false);
  const [textAnnId, setTextAnnId] = useState<string | null>(null);
  const [textVal,   setTextVal]   = useState("");
  const [textPos,   setTextPos]   = useState({ x: 0, y: 0 });

  /* render PDF layer */
  useEffect(() => {
    if (!arrayBuffer || !pdfCvs.current) return;
    let alive = true;
    (async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: copyAB(arrayBuffer) }).promise;
        if (!alive) { pdf.destroy(); return; }
        const page = await pdf.getPage(pageNumber);
        if (!alive) { pdf.destroy(); return; }
        const vp = page.getViewport({ scale });
        const c = pdfCvs.current!;
        c.width = vp.width; c.height = vp.height;
        setDims({ w: vp.width, h: vp.height });
        renderTask.current = page.render({ canvasContext: c.getContext("2d")!, viewport: vp });
        await renderTask.current.promise;
        pdf.destroy();
      } catch { /* cancelled */ }
    })();
    return () => { alive = false; renderTask.current?.cancel(); };
  }, [arrayBuffer, pageNumber, scale]);

  /* redraw annotation layer */
  useEffect(() => {
    const c = drawCvs.current;
    if (!c || dims.w === 0) return;
    c.width = dims.w; c.height = dims.h;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, dims.w, dims.h);

    const pageAnns = annotations.filter(a => a.page === pageNumber);
    pageAnns.forEach(ann => {
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.fillColor || ann.color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round"; ctx.lineJoin = "round";

      if (ann.type === "text" && ann.content) {
        const parts = [ann.bold ? "bold" : "", ann.italic ? "italic" : ""].filter(Boolean).join(" ");
        ctx.font = `${parts} ${ann.fontSize || 16}px Inter, sans-serif`;
        ctx.fillStyle = ann.color;
        ctx.fillText(ann.content, ann.x, ann.y);
        if (ann.underline) {
          const tw = ctx.measureText(ann.content).width;
          ctx.beginPath(); ctx.moveTo(ann.x, ann.y + 3); ctx.lineTo(ann.x + tw, ann.y + 3); ctx.stroke();
        }
      } else if (ann.type === "highlight" && ann.width && ann.height) {
        ctx.globalAlpha = 0.35;
        ctx.fillRect(ann.x, ann.y, ann.width, ann.height);
        ctx.globalAlpha = 1;
      } else if (ann.type === "draw" && ann.points?.length) {
        ctx.beginPath();
        ann.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();
      } else if (ann.type === "rectangle" && ann.width && ann.height) {
        if (ann.fill) { ctx.globalAlpha = 0.3; ctx.fillRect(ann.x, ann.y, ann.width, ann.height); ctx.globalAlpha = 1; }
        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
      } else if (ann.type === "circle" && ann.width && ann.height) {
        const cx = ann.x + ann.width / 2, cy = ann.y + ann.height / 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(ann.width / 2), Math.abs(ann.height / 2), 0, 0, 2 * Math.PI);
        if (ann.fill) { ctx.globalAlpha = 0.3; ctx.fill(); ctx.globalAlpha = 1; }
        ctx.stroke();
      } else if (ann.type === "line" && ann.points?.length === 2) {
        ctx.beginPath(); ctx.moveTo(ann.points[0].x, ann.points[0].y); ctx.lineTo(ann.points[1].x, ann.points[1].y); ctx.stroke();
      }

      /* selection ring */
      if (ann.id === selectedId) {
        ctx.strokeStyle = "#e64809"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
        const pad = 6;
        if (ann.width && ann.height) {
          ctx.strokeRect(ann.x - pad, ann.y - pad, ann.width + pad * 2, ann.height + pad * 2);
        } else if (ann.type === "text" && ann.content) {
          ctx.font = `${ann.fontSize || 16}px Inter, sans-serif`;
          const tw = ctx.measureText(ann.content).width;
          ctx.strokeRect(ann.x - pad, ann.y - (ann.fontSize || 16) - pad, tw + pad * 2, (ann.fontSize || 16) + pad * 2);
        }
        ctx.setLineDash([]);
      }
    });

    /* temp shape preview */
    if (shapeStart && shapeEnd) {
      ctx.strokeStyle = "#e64809"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      const w = shapeEnd.x - shapeStart.x, h = shapeEnd.y - shapeStart.y;
      if (tool === "rectangle") ctx.strokeRect(shapeStart.x, shapeStart.y, w, h);
      else if (tool === "circle") {
        ctx.beginPath(); ctx.ellipse(shapeStart.x + w/2, shapeStart.y + h/2, Math.abs(w/2), Math.abs(h/2), 0, 0, 2*Math.PI); ctx.stroke();
      } else if (tool === "line") {
        ctx.beginPath(); ctx.moveTo(shapeStart.x, shapeStart.y); ctx.lineTo(shapeEnd.x, shapeEnd.y); ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  }, [annotations, pageNumber, dims, selectedId, shapeStart, shapeEnd, tool]);

  const mouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = drawCvs.current!;
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  };

  const startText = (id: string | null, txt: string, x: number, y: number) => {
    setTextAnnId(id); setTextVal(txt); setTextPos({ x, y }); setTextEdit(true);
    setTimeout(() => textRef.current?.focus(), 0);
  };
  const finishText = () => {
    if (textVal.trim()) {
      if (textAnnId) {
        onAnnotationsChange(annotations.map(a => a.id === textAnnId ? { ...a, content: textVal } : a));
      } else {
        const ann: Annotation = {
          id: Date.now().toString(), type: "text", page: pageNumber,
          x: textPos.x, y: textPos.y, width: 200, height: 30,
          content: textVal, color: fmt.color, fontSize: fmt.fontSize,
          bold: fmt.bold, italic: fmt.italic, underline: fmt.underline,
        };
        onAnnotationsChange([...annotations, ann]);
        onSelect(ann.id);
      }
    }
    setTextEdit(false); setTextAnnId(null); setTextVal("");
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (textEdit) return;
    const pos = mouse(e);
    if (tool === "select") {
      let found = false;
      for (let i = annotations.length - 1; i >= 0; i--) {
        const a = annotations[i];
        if (a.page !== pageNumber) continue;
        const hit = (a.width && a.height)
          ? pos.x >= a.x - 8 && pos.x <= a.x + a.width + 8 && pos.y >= a.y - 8 && pos.y <= a.y + a.height + 8
          : pos.x >= a.x - 12 && pos.x <= a.x + 100 && pos.y >= a.y - 20 && pos.y <= a.y + 8;
        if (hit) {
          onSelect(a.id);
          if (a.type === "text") startText(a.id, a.content || "", a.x, a.y);
          found = true; break;
        }
      }
      if (!found) { onSelect(null); setTextEdit(false); }
    } else if (tool === "draw") { setDrawing(true); setPts([pos]); }
    else if (["rectangle","circle","line"].includes(tool)) { setShapeStart(pos); setShapeEnd(pos); }
    else if (tool === "text") { startText(null, "", pos.x, pos.y); }
    else if (tool === "highlight") {
      const ann: Annotation = { id: Date.now().toString(), type: "highlight", page: pageNumber, x: pos.x, y: pos.y - 20, width: 180, height: 24, color: fmt.color, fill: true };
      onAnnotationsChange([...annotations, ann]); onSelect(ann.id);
    }
  };
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (textEdit) return;
    const pos = mouse(e);
    if (drawing) setPts(p => [...p, pos]);
    else if (shapeStart) setShapeEnd(pos);
  };
  const onMouseUp = () => {
    if (drawing && pts.length > 1) {
      const ann: Annotation = { id: Date.now().toString(), type: "draw", page: pageNumber, x: pts[0].x, y: pts[0].y, color: fmt.color, points: pts };
      onAnnotationsChange([...annotations, ann]); onSelect(ann.id);
    } else if (shapeStart && shapeEnd) {
      const mk = (type: Annotation["type"]): Annotation => ({
        id: Date.now().toString(), type, page: pageNumber,
        x: Math.min(shapeStart.x, shapeEnd!.x), y: Math.min(shapeStart.y, shapeEnd!.y),
        width: Math.abs(shapeEnd!.x - shapeStart.x), height: Math.abs(shapeEnd!.y - shapeStart.y),
        color: fmt.color, fill: false,
        points: tool === "line" ? [shapeStart, shapeEnd!] : undefined,
      });
      if (tool === "rectangle" || tool === "circle") { const a = mk(tool); onAnnotationsChange([...annotations, a]); onSelect(a.id); }
      else if (tool === "line") {
        const a: Annotation = { id: Date.now().toString(), type: "line", page: pageNumber, x: shapeStart.x, y: shapeStart.y, color: fmt.color, points: [shapeStart, shapeEnd!] };
        onAnnotationsChange([...annotations, a]); onSelect(a.id);
      }
    }
    setDrawing(false); setPts([]); setShapeStart(null); setShapeEnd(null);
  };

  const cursorClass = tool === "select" ? "cursor-default"
    : tool === "text" ? "cursor-text"
    : "cursor-crosshair";

  return (
    <div className="relative inline-block select-none" style={{ lineHeight: 0 }}>
      <canvas ref={pdfCvs} className="absolute top-0 left-0 pointer-events-none block" />
      <canvas ref={drawCvs} className={`relative z-10 block ${cursorClass}`}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} />
      {textEdit && (
        <textarea ref={textRef} value={textVal} onChange={e => setTextVal(e.target.value)}
          onBlur={finishText}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); finishText(); } else if (e.key === "Escape") { setTextEdit(false); } }}
          style={{
            position: "absolute", left: textPos.x, top: textPos.y - (fmt.fontSize),
            fontSize: fmt.fontSize, color: fmt.color,
            fontWeight: fmt.bold ? "bold" : "normal",
            fontStyle: fmt.italic ? "italic" : "normal",
            textDecoration: fmt.underline ? "underline" : "none",
            fontFamily: "Inter, sans-serif",
            minWidth: 120, maxWidth: 480,
            border: "2px solid #e64809", borderRadius: 6,
            background: "rgba(255,255,255,.95)", padding: "2px 6px",
            resize: "none", outline: "none", zIndex: 100,
          }}
          rows={1}
        />
      )}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
const ZOOM_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

const TOOLS_LIST: { id: Tool; label: string; shortcut: string; icon: React.ReactNode }[] = [
  { id: "select",    label: "Seleksi",    shortcut: "V", icon: <MousePointer2 className="w-4 h-4" /> },
  { id: "text",      label: "Teks",       shortcut: "T", icon: <Type className="w-4 h-4" /> },
  { id: "highlight", label: "Highlight",  shortcut: "H", icon: <Highlighter className="w-4 h-4" /> },
  { id: "draw",      label: "Gambar",     shortcut: "D", icon: <Pencil className="w-4 h-4" /> },
  { id: "rectangle", label: "Persegi",    shortcut: "R", icon: <Square className="w-4 h-4" /> },
  { id: "circle",    label: "Lingkaran",  shortcut: "O", icon: <Circle className="w-4 h-4" /> },
  { id: "line",      label: "Garis",      shortcut: "L", icon: <Minus className="w-4 h-4" /> },
];

export default function EditPage() {
  const [file, setFile]             = useState<File | null>(null);
  const [fileAB, setFileAB]         = useState<ArrayBuffer | null>(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [tool, setTool]             = useState<Tool>("select");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving]     = useState(false);
  const [saveOk, setSaveOk]         = useState(false);
  const [zoomIdx, setZoomIdx]       = useState(2); // 1.0 default
  const scale = ZOOM_STEPS[zoomIdx];

  const [fmt, setFmt] = useState({ fontSize: 16, color: "#000000", bold: false, italic: false, underline: false });

  /* load file */
  const loadFile = useCallback(async (f: File) => {
    setFile(f); setSaveOk(false);
    const ab = await f.arrayBuffer();
    setFileAB(ab);
    const pdf = await pdfjsLib.getDocument({ data: copyAB(ab) }).promise;
    setTotalPages(pdf.numPages);
    setPage(1);
    pdf.destroy();
  }, []);

  /* keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key === "v") setTool("select");
      else if (key === "t") setTool("text");
      else if (key === "h") setTool("highlight");
      else if (key === "d") setTool("draw");
      else if (key === "r") setTool("rectangle");
      else if (key === "o") setTool("circle");
      else if (key === "l") setTool("line");
      else if (key === "delete" || key === "backspace") {
        if (selectedId) {
          setAnnotations(a => a.filter(x => x.id !== selectedId));
          setSelectedId(null);
        }
      } else if (key === "+" || key === "=") setZoomIdx(i => Math.min(i + 1, ZOOM_STEPS.length - 1));
      else if (key === "-") setZoomIdx(i => Math.max(i - 1, 0));
      else if (key === "0") setZoomIdx(2);
      else if (key === "arrowleft") setPage(p => Math.max(1, p - 1));
      else if (key === "arrowright") setPage(p => Math.min(totalPages, p + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, totalPages]);

  /* update fmt when selecting a text annotation */
  useEffect(() => {
    if (!selectedId) return;
    const ann = annotations.find(a => a.id === selectedId);
    if (ann?.type === "text") {
      setFmt({ fontSize: ann.fontSize || 16, color: ann.color, bold: ann.bold || false, italic: ann.italic || false, underline: ann.underline || false });
    }
  }, [selectedId, annotations]);

  const updateFmt = (key: string, value: any) => {
    setFmt(prev => ({ ...prev, [key]: value }));
    if (selectedId) {
      setAnnotations(prev => prev.map(a =>
        a.id === selectedId && a.type === "text" ? { ...a, [key]: value } : a
      ));
    }
  };

  /* save to PDF */
  const handleSave = async () => {
    if (!fileAB) return;
    setIsSaving(true); setSaveOk(false);
    try {
      const doc = await PDFDocument.load(fileAB);
      const pages = doc.getPages();
      const font = await doc.embedFont(StandardFonts.Helvetica);

      for (let i = 0; i < pages.length; i++) {
        const pg = pages[i];
        const ph = pg.getHeight();
        const anns = annotations.filter(a => a.page === i + 1);
        for (const ann of anns) {
          const c = hexRgb(ann.color);
          if (ann.type === "text") {
            pg.drawText(ann.content || "", { x: ann.x, y: ph - ann.y, size: ann.fontSize || 16, font, color: rgb(c.r,c.g,c.b) });
          } else if (ann.type === "highlight") {
            pg.drawRectangle({ x: ann.x, y: ph - ann.y - (ann.height||24), width: ann.width||180, height: ann.height||24, color: rgb(c.r,c.g,c.b), opacity: 0.35 });
          } else if (ann.type === "draw" && ann.points) {
            for (let j = 0; j < ann.points.length - 1; j++) {
              pg.drawLine({ start: { x: ann.points[j].x, y: ph - ann.points[j].y }, end: { x: ann.points[j+1].x, y: ph - ann.points[j+1].y }, color: rgb(c.r,c.g,c.b), thickness: 2.5 });
            }
          } else if (ann.type === "rectangle" && ann.width && ann.height) {
            if (ann.fill) pg.drawRectangle({ x: ann.x, y: ph - ann.y - ann.height, width: ann.width, height: ann.height, color: rgb(c.r,c.g,c.b), opacity: 0.3 });
            pg.drawRectangle({ x: ann.x, y: ph - ann.y - ann.height, width: ann.width, height: ann.height, borderColor: rgb(c.r,c.g,c.b), borderWidth: 2 });
          } else if (ann.type === "circle" && ann.width && ann.height) {
            const cx = ann.x + ann.width/2, cy = ph - ann.y - ann.height/2;
            if (ann.fill) pg.drawEllipse({ x: cx, y: cy, xSemiAxis: ann.width/2, ySemiAxis: ann.height/2, color: rgb(c.r,c.g,c.b), opacity: 0.3 });
            pg.drawEllipse({ x: cx, y: cy, xSemiAxis: ann.width/2, ySemiAxis: ann.height/2, borderColor: rgb(c.r,c.g,c.b), borderWidth: 2 });
          } else if (ann.type === "line" && ann.points) {
            pg.drawLine({ start: { x: ann.points[0].x, y: ph - ann.points[0].y }, end: { x: ann.points[1].x, y: ph - ann.points[1].y }, color: rgb(c.r,c.g,c.b), thickness: 2.5 });
          }
        }
      }

      const bytes = await doc.save();
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const a = document.createElement("a"); a.href = url; a.download = "edited.pdf"; a.click();
      URL.revokeObjectURL(url);
      setSaveOk(true); setTimeout(() => setSaveOk(false), 3000);
    } catch { alert("Gagal menyimpan file"); }
    finally { setIsSaving(false); }
  };

  const selectedAnn = annotations.find(a => a.id === selectedId);
  const isTxtTool   = tool === "text" || (selectedAnn?.type === "text");

  /* ── JSX ── */
  if (!file) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Header activePath="/edit" />
        <main className="flex items-center justify-center min-h-[calc(100vh-60px)] p-6">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Pencil className="w-8 h-8 text-brand-500" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Edit PDF</h1>
              <p className="text-[var(--text-muted)] text-sm">
                Tambahkan teks, highlight, gambar, dan anotasi pada PDF Anda
              </p>
            </div>
            <DropZone
              onFiles={(files) => loadFile(files[0])}
              accept="application/pdf"
            />
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { icon: <Type className="w-4 h-4" />, label: "Tambah Teks" },
                { icon: <Highlighter className="w-4 h-4" />, label: "Highlight" },
                { icon: <Pencil className="w-4 h-4" />, label: "Gambar Bebas" },
                { icon: <Square className="w-4 h-4" />, label: "Bentuk" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-[var(--border)] text-center">
                  <span className="text-brand-500">{f.icon}</span>
                  <span className="text-xs font-medium text-[var(--text-muted)]">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <Header activePath="/edit" />

      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-[var(--border)] px-4 py-2 flex items-center gap-1 flex-wrap sticky top-[60px] z-40">

        {/* Tool buttons */}
        <div className="flex items-center gap-0.5 bg-[var(--bg)] rounded-xl p-1 mr-2">
          {TOOLS_LIST.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={`${t.label} (${t.shortcut})`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-100 ${
                tool === t.id
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Separator */}
        <span className="w-px h-6 bg-[var(--border)] mx-1" />

        {/* Text format — only show when text tool/annotation is active */}
        {isTxtTool && (
          <>
            <select
              value={fmt.fontSize}
              onChange={(e) => updateFmt("fontSize", parseInt(e.target.value))}
              className="input w-16 py-1 text-xs"
            >
              {[8, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <button onClick={() => updateFmt("bold", !fmt.bold)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${fmt.bold ? "bg-brand-100 text-brand-600" : "hover:bg-[var(--bg)] text-[var(--text-muted)]"}`}>
              <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => updateFmt("italic", !fmt.italic)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${fmt.italic ? "bg-brand-100 text-brand-600" : "hover:bg-[var(--bg)] text-[var(--text-muted)]"}`}>
              <Italic className="w-4 h-4" />
            </button>
            <button onClick={() => updateFmt("underline", !fmt.underline)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${fmt.underline ? "bg-brand-100 text-brand-600" : "hover:bg-[var(--bg)] text-[var(--text-muted)]"}`}>
              <Underline className="w-4 h-4" />
            </button>

            <div className="relative">
              <input type="color" value={fmt.color} onChange={(e) => updateFmt("color", e.target.value)}
                className="w-8 h-8 rounded-lg border border-[var(--border)] cursor-pointer p-0.5 bg-white" />
            </div>

            <span className="w-px h-6 bg-[var(--border)] mx-1" />
          </>
        )}

        {/* Delete selected */}
        {selectedId && (
          <button
            onClick={() => { setAnnotations(a => a.filter(x => x.id !== selectedId)); setSelectedId(null); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
            title="Hapus (Delete)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-[var(--bg)] rounded-xl p-1">
          <button onClick={() => setZoomIdx(i => Math.max(i - 1, 0))} disabled={zoomIdx === 0}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-white hover:text-[var(--text)] disabled:opacity-40 transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setZoomIdx(2)}
            className="px-2 py-1 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:bg-white hover:text-[var(--text)] transition-colors min-w-[44px] text-center">
            {Math.round(scale * 100)}%
          </button>
          <button onClick={() => setZoomIdx(i => Math.min(i + 1, ZOOM_STEPS.length - 1))} disabled={zoomIdx === ZOOM_STEPS.length - 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-white hover:text-[var(--text)] disabled:opacity-40 transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Page nav */}
        <div className="flex items-center gap-1 bg-[var(--bg)] rounded-xl p-1 ml-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-white disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-[var(--text-muted)] px-1 min-w-[52px] text-center">
            {page} / {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-white disabled:opacity-40 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          loading={isSaving}
          size="sm"
          icon={saveOk ? <CheckCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          variant={saveOk ? "outline" : "brand"}
          className="ml-2"
        >
          {saveOk ? "Tersimpan!" : "Simpan"}
        </Button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Page thumbnails */}
        <div className="w-[140px] flex-shrink-0 bg-white border-r border-[var(--border)] overflow-y-auto p-2.5 space-y-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <PageThumb key={n} arrayBuffer={fileAB} pageNumber={n} selected={page === n} onClick={() => setPage(n)} />
          ))}
        </div>

        {/* Canvas area */}
        <div className="flex-1 overflow-auto p-8 flex justify-center items-start"
          style={{ background: "repeating-linear-gradient(45deg,#f0ece8 0px,#f0ece8 2px,var(--bg) 2px,var(--bg) 20px)" }}>
          <div className="shadow-[var(--shadow-lg)] rounded-lg overflow-hidden">
            <EditorCanvas
              arrayBuffer={fileAB}
              pageNumber={page}
              tool={tool}
              annotations={annotations}
              onAnnotationsChange={setAnnotations}
              selectedId={selectedId}
              onSelect={setSelectedId}
              scale={scale}
              fmt={fmt}
            />
          </div>
        </div>

        {/* Properties sidebar */}
        <div className="w-64 flex-shrink-0 bg-white border-l border-[var(--border)] flex flex-col overflow-y-auto">
          <div className="px-4 pt-4 pb-3 border-b border-[var(--border)]">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Properties</p>
          </div>

          <div className="flex-1 p-4 space-y-5 overflow-y-auto">
            {/* File info */}
            <div>
              <p className="label">File</p>
              <div className="card p-3">
                <p className="text-xs font-semibold text-[var(--text)] truncate">{file.name}</p>
                <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">{totalPages} halaman · {Math.round(file.size / 1024)} KB</p>
              </div>
            </div>

            {/* Annotation count */}
            <div>
              <p className="label">Anotasi</p>
              <div className="card p-3">
                <p className="text-xs text-[var(--text-muted)]">
                  <span className="font-bold text-brand-500 text-sm">{annotations.length}</span> anotasi total
                </p>
                <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">
                  {annotations.filter(a => a.page === page).length} di halaman ini
                </p>
              </div>
            </div>

            {/* Selected annotation properties */}
            {selectedAnn && (
              <div>
                <p className="label">Pilihan</p>
                <div className="space-y-3 card p-3">
                  <div>
                    <p className="text-[11px] text-[var(--text-subtle)] mb-1.5 font-medium">Warna</p>
                    <input type="color" value={selectedAnn.color}
                      onChange={(e) => setAnnotations(prev => prev.map(a => a.id === selectedId ? { ...a, color: e.target.value } : a))}
                      className="w-full h-8 rounded-lg border border-[var(--border)] cursor-pointer" />
                  </div>
                  {["rectangle","circle","highlight"].includes(selectedAnn.type) && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedAnn.fill || false}
                        onChange={(e) => setAnnotations(prev => prev.map(a => a.id === selectedId ? { ...a, fill: e.target.checked } : a))}
                        className="w-4 h-4 accent-brand-500 rounded" />
                      <span className="text-xs font-medium text-[var(--text-muted)]">Isi bentuk</span>
                    </label>
                  )}
                  <button onClick={() => { setAnnotations(a => a.filter(x => x.id !== selectedId)); setSelectedId(null); }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Anotasi
                  </button>
                </div>
              </div>
            )}

            {/* Keyboard shortcuts */}
            <div>
              <p className="label">Pintasan</p>
              <div className="space-y-1">
                {[
                  ["V", "Seleksi"], ["T", "Teks"], ["H", "Highlight"],
                  ["D", "Gambar"], ["R", "Persegi"], ["O", "Lingkaran"],
                  ["+/-", "Zoom"], ["← →", "Halaman"], ["Del", "Hapus"],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <span className="text-[11px] text-[var(--text-muted)]">{label}</span>
                    <kbd className="text-[10px] font-mono font-semibold bg-[var(--bg)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[var(--text-subtle)]">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer save */}
          <div className="p-4 border-t border-[var(--border)]">
            <Button onClick={handleSave} loading={isSaving} fullWidth size="md"
              icon={saveOk ? <CheckCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              variant={saveOk ? "outline" : "brand"}>
              {saveOk ? "Tersimpan!" : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Helper ─────────────────────────────────────────────────────────────── */
function hexRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? { r: parseInt(r[1], 16) / 255, g: parseInt(r[2], 16) / 255, b: parseInt(r[3], 16) / 255 }
    : { r: 0, g: 0, b: 0 };
}
