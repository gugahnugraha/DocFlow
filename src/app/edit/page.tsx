"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Pencil, Trash2, Save, ChevronLeft, ChevronRight,
  Bold, Italic, Underline, Square, Circle, Minus,
  ZoomIn, ZoomOut, CheckCheck, Type, Highlighter,
  MousePointer2, Undo2, Redo2,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import Button from "@/components/Button";
import ProtectedRoute from "@/components/ProtectedRoute";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const copyAB = (b: ArrayBuffer) => b.slice(0);

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
  isExtracted?: boolean;
  // Set when an extracted annotation is edited — preserves original position for whiteout
  wasExtracted?: boolean;
  origX?: number; origY?: number; origW?: number; origH?: number;
}

/* ─── Sidebar thumbnail ────────────────────────────────────────────────────── */
function PageThumb({ arrayBuffer, pageNumber, selected, onClick }: {
  arrayBuffer: ArrayBuffer | null; pageNumber: number; selected: boolean; onClick: () => void;
}) {
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
    <button onClick={onClick}
      className={`group w-full text-left rounded-xl overflow-hidden border-2 transition-all duration-150 ${
        selected ? "border-brand-500 shadow-[0_0_0_3px_rgba(230,72,9,.15)]" : "border-transparent hover:border-[var(--border)]"
      }`}>
      <div className="bg-slate-100 flex items-center justify-center min-h-[80px] relative">
        {loading && <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />}
        <canvas ref={cvs} className="w-full h-auto block" style={{ display: loading ? "none" : "block" }} />
      </div>
      <div className={`text-center py-1 text-[11px] font-semibold transition-colors ${
        selected ? "text-brand-600 bg-brand-50" : "text-[var(--text-subtle)] bg-white group-hover:bg-[var(--bg)]"
      }`}>{pageNumber}</div>
    </button>
  );
}

/* ─── Editor Canvas ────────────────────────────────────────────────────────── */
function EditorCanvas({ arrayBuffer, pageNumber, tool, annotations, onAnnotationsChange, selectedId, onSelect, scale, fmt, onActivatePage }: {
  arrayBuffer: ArrayBuffer | null; pageNumber: number; tool: Tool;
  annotations: Annotation[]; onAnnotationsChange: (a: Annotation[]) => void;
  selectedId: string | null; onSelect: (id: string | null) => void;
  scale: number;
  fmt: { fontSize: number; color: string; bold: boolean; italic: boolean; underline: boolean };
  onActivatePage?: (page: number) => void;
}) {
  const pdfCvs  = useRef<HTMLCanvasElement>(null);
  const drawCvs = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const renderTask = useRef<any>(null);

  const [dims, setDims]             = useState({ w: 0, h: 0 });
  const [drawing, setDrawing]       = useState(false);
  const [pts, setPts]               = useState<{ x: number; y: number }[]>([]);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapeEnd, setShapeEnd]     = useState<{ x: number; y: number } | null>(null);
  const [textEdit, setTextEdit]     = useState(false);
  const [textAnnId, setTextAnnId]   = useState<string | null>(null);
  const [textVal, setTextVal]       = useState("");
  // DOM pixel position for the textarea overlay
  const [textDomPos, setTextDomPos] = useState({ x: 0, y: 0 });
  // Canvas pixel position for PDF coordinate storage
  const [textCanvasPos, setTextCanvasPos] = useState({ x: 0, y: 0 });

  /* render PDF */
  useEffect(() => {
    if (!arrayBuffer || !pdfCvs.current) return;
    let alive = true;
    (async () => {
      try {
        renderTask.current?.cancel();
        const pdf = await pdfjsLib.getDocument({ data: copyAB(arrayBuffer) }).promise;
        if (!alive) { pdf.destroy(); return; }
        const page = await pdf.getPage(pageNumber);
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

  /* redraw annotations */
  useEffect(() => {
    const c = drawCvs.current;
    const pdfC = pdfCvs.current;
    if (!c || dims.w === 0) return;
    c.width = dims.w; c.height = dims.h;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, dims.w, dims.h);

    annotations.filter(a => a.page === pageNumber).forEach(ann => {
      ctx.strokeStyle = ann.color;
      ctx.fillStyle   = ann.fillColor || ann.color;
      ctx.lineWidth   = 2.5;
      ctx.lineCap = "round"; ctx.lineJoin = "round";

      if (ann.type === "text" && ann.content) {
        if (ann.isExtracted) {
          // Original text lives in pdfjs layer — don't redraw, skip
        } else {
          // Edited or newly-added text: cover original with white first, then draw new text
          // (only cover if this was originally extracted — wasExtracted flag)
          if (ann.wasExtracted && ann.origX !== undefined && ann.origY !== undefined && ann.origW && ann.origH && pdfC) {
            // Erase the original pdfjs-rendered text by painting white over it
            const pdfCtx = pdfC.getContext("2d")!;
            const pad = 3;
            pdfCtx.fillStyle = "#ffffff";
            pdfCtx.fillRect(ann.origX - pad, ann.origY - ann.origH - pad, ann.origW + pad * 2, ann.origH * 1.5 + pad * 2);
          }
          const weight = ann.bold ? "bold " : "";
          const style  = ann.italic ? "italic " : "";
          ctx.font = `${weight}${style}${ann.fontSize || 14}px Inter, Arial, sans-serif`;
          ctx.fillStyle = ann.color;
          ctx.fillText(ann.content, ann.x, ann.y);
          if (ann.underline) {
            const tw = ctx.measureText(ann.content).width;
            ctx.beginPath(); ctx.moveTo(ann.x, ann.y + 2); ctx.lineTo(ann.x + tw, ann.y + 2); ctx.stroke();
          }
        }
      } else if (ann.type === "highlight" && ann.width && ann.height) {
        ctx.globalAlpha = 0.35; ctx.fillRect(ann.x, ann.y, ann.width, ann.height); ctx.globalAlpha = 1;
      } else if (ann.type === "draw" && ann.points?.length) {
        ctx.beginPath(); ann.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.stroke();
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
        const pad = 4;
        if (ann.type === "text" && ann.isExtracted) {
          // Extracted: coords at scale 1.0 — multiply by render scale
          const fSize = (ann.fontSize || 12) * scale;
          const tWidth = Math.max((ann.width || 0) * scale, fSize * 2);
          const sx = ann.x * scale;
          const sy = ann.y * scale;
          ctx.fillStyle = "rgba(230,72,9,0.06)";
          ctx.fillRect(sx - pad, sy - fSize - pad, tWidth + pad * 2, fSize * 1.5 + pad * 2);
          ctx.strokeRect(sx - pad, sy - fSize - pad, tWidth + pad * 2, fSize * 1.5 + pad * 2);
        } else if (ann.type === "text" && ann.content) {
          const fSize = ann.fontSize || 14;
          ctx.font = `${fSize}px Inter, Arial, sans-serif`;
          const tw = ctx.measureText(ann.content).width;
          ctx.strokeRect(ann.x - pad, ann.y - fSize - pad, tw + pad * 2, fSize * 1.4 + pad * 2);
        } else if (ann.width && ann.height) {
          ctx.strokeRect(ann.x - pad, ann.y - pad, ann.width + pad * 2, ann.height + pad * 2);
        }
        ctx.setLineDash([]);
      }
    });

    /* temp shape preview */
    if (shapeStart && shapeEnd) {
      ctx.strokeStyle = "#e64809"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      const w = shapeEnd.x - shapeStart.x, h = shapeEnd.y - shapeStart.y;
      if (tool === "rectangle") ctx.strokeRect(shapeStart.x, shapeStart.y, w, h);
      else if (tool === "circle") { ctx.beginPath(); ctx.ellipse(shapeStart.x + w/2, shapeStart.y + h/2, Math.abs(w/2), Math.abs(h/2), 0, 0, 2*Math.PI); ctx.stroke(); }
      else if (tool === "line") { ctx.beginPath(); ctx.moveTo(shapeStart.x, shapeStart.y); ctx.lineTo(shapeEnd.x, shapeEnd.y); ctx.stroke(); }
      ctx.setLineDash([]);
    }
  }, [annotations, pageNumber, dims, selectedId, shapeStart, shapeEnd, tool, scale]);

  /* mouse → canvas pixel coords */
  const mouse = (e: React.MouseEvent): { cx: number; cy: number; dx: number; dy: number } => {
    const c = drawCvs.current!;
    const rect = c.getBoundingClientRect();
    const scaleX = c.width / rect.width;
    const scaleY = c.height / rect.height;
    const dx = e.clientX - rect.left;
    const dy = e.clientY - rect.top;
    return { cx: dx * scaleX, cy: dy * scaleY, dx, dy };
  };

  const openTextEdit = (id: string | null, txt: string, dx: number, dy: number, cx: number, cy: number) => {
    setTextAnnId(id); setTextVal(txt);
    setTextDomPos({ x: dx, y: dy });
    setTextCanvasPos({ x: cx, y: cy });
    setTextEdit(true);
    setTimeout(() => { textRef.current?.focus(); textRef.current?.select(); }, 10);
  };

  const commitText = () => {
    if (textVal.trim()) {
      if (textAnnId) {
        const orig = annotations.find(a => a.id === textAnnId);
        const wasExt = orig?.isExtracted === true;
        onAnnotationsChange(annotations.map(a => {
          if (a.id !== textAnnId) return a;
          return {
            ...a,
            content: textVal,
            isExtracted: false,
            wasExtracted: wasExt || a.wasExtracted,
            // Preserve original position for whiteout (scale-1.0 coords → canvas coords)
            origX: wasExt ? a.x * scale : a.origX,
            origY: wasExt ? a.y * scale : a.origY,
            origW: wasExt ? (a.width || 0) * scale : a.origW,
            origH: wasExt ? (a.fontSize || 12) * scale : a.origH,
            // Move x/y to canvas-scale coords so text renders correctly
            x: wasExt ? a.x * scale : a.x,
            y: wasExt ? a.y * scale : a.y,
          };
        }));
      } else {
        const ann: Annotation = {
          id: Date.now().toString(), type: "text", page: pageNumber,
          x: textCanvasPos.x, y: textCanvasPos.y + (fmt.fontSize * 0.85),
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
    if (typeof onActivatePage === "function") onActivatePage(pageNumber);
    if (textEdit) { commitText(); return; }
    const { cx, cy, dx, dy } = mouse(e);
    const c = drawCvs.current!;
    const rect = c.getBoundingClientRect();
    const scaleX = c.width / rect.width;
    const scaleY = c.height / rect.height;

    if (tool === "select") {
      let found = false;
      for (let i = annotations.length - 1; i >= 0; i--) {
        const a = annotations[i];
        if (a.page !== pageNumber) continue;
        let hit = false;
        if (a.type === "text" && a.isExtracted) {
          // Extracted coords stored at scale 1.0 — compare to canvas pixels by scaling
          const ax = a.x * scale;
          const ay = a.y * scale;
          const aw = Math.max((a.width || 0) * scale, (a.fontSize || 12) * scale * 2);
          const ah = (a.fontSize || 12) * scale * 1.5;
          hit = cx >= ax - 4 && cx <= ax + aw + 4 && cy >= ay - ah - 4 && cy <= ay + 4;
        } else if (a.type === "text" && a.content) {
          const approxW = a.content.length * (a.fontSize || 12) * 0.6;
          const fh = a.fontSize || 14;
          hit = cx >= a.x - 6 && cx <= a.x + approxW + 6 && cy >= a.y - fh - 6 && cy <= a.y + 6;
        } else if (a.width && a.height) {
          hit = cx >= a.x - 8 && cx <= a.x + a.width + 8 && cy >= a.y - 8 && cy <= a.y + a.height + 8;
        }
        if (hit) {
          onSelect(a.id);
          if (a.type === "text") {
            // For textarea DOM position: use canvas display coords
            const domX = a.isExtracted ? a.x * scale / scaleX : a.x / scaleX;
            const domY = a.isExtracted ? a.y * scale / scaleY : a.y / scaleY;
            openTextEdit(a.id, a.content || "", domX, domY - (a.fontSize || 14), cx, cy);
          }
          found = true; break;
        }
      }
      if (!found) { onSelect(null); }
    } else if (tool === "draw") {
      setDrawing(true); setPts([{ x: cx, y: cy }]);
    } else if (["rectangle","circle","line"].includes(tool)) {
      setShapeStart({ x: cx, y: cy }); setShapeEnd({ x: cx, y: cy });
    } else if (tool === "text") {
      openTextEdit(null, "", dx, dy, cx, cy);
    } else if (tool === "highlight") {
      const ann: Annotation = { id: Date.now().toString(), type: "highlight", page: pageNumber, x: cx, y: cy - 18, width: 200, height: 20, color: fmt.color, fill: true };
      onAnnotationsChange([...annotations, ann]); onSelect(ann.id);
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (textEdit) return;
    const { cx, cy } = mouse(e);
    if (drawing) setPts(p => [...p, { x: cx, y: cy }]);
    else if (shapeStart) setShapeEnd({ x: cx, y: cy });
  };

  const onMouseUp = () => {
    if (drawing && pts.length > 1) {
      const ann: Annotation = { id: Date.now().toString(), type: "draw", page: pageNumber, x: pts[0].x, y: pts[0].y, color: fmt.color, points: pts };
      onAnnotationsChange([...annotations, ann]); onSelect(ann.id);
    } else if (shapeStart && shapeEnd && (shapeStart.x !== shapeEnd.x || shapeStart.y !== shapeEnd.y)) {
      if (tool === "rectangle" || tool === "circle") {
        const ann: Annotation = {
          id: Date.now().toString(), type: tool, page: pageNumber,
          x: Math.min(shapeStart.x, shapeEnd.x), y: Math.min(shapeStart.y, shapeEnd.y),
          width: Math.abs(shapeEnd.x - shapeStart.x), height: Math.abs(shapeEnd.y - shapeStart.y),
          color: fmt.color, fill: false,
        };
        onAnnotationsChange([...annotations, ann]); onSelect(ann.id);
      } else if (tool === "line") {
        const ann: Annotation = { id: Date.now().toString(), type: "line", page: pageNumber, x: shapeStart.x, y: shapeStart.y, color: fmt.color, points: [shapeStart, shapeEnd] };
        onAnnotationsChange([...annotations, ann]); onSelect(ann.id);
      }
    }
    setDrawing(false); setPts([]); setShapeStart(null); setShapeEnd(null);
  };

  const cursorClass = tool === "select" ? "cursor-default" : tool === "text" ? "cursor-text" : "cursor-crosshair";

  return (
    <div ref={containerRef} className="relative inline-block select-none overflow-hidden" style={{ lineHeight: 0 }}>
      <canvas ref={pdfCvs} className="absolute top-0 left-0 pointer-events-none block" />
      <canvas ref={drawCvs} className={`relative z-10 block ${cursorClass}`}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} />

      {textEdit && (
        <textarea
          ref={textRef}
          value={textVal}
          onChange={e => {
            setTextVal(e.target.value);
            // auto-resize
            if (textRef.current) { textRef.current.style.height = "auto"; textRef.current.style.height = textRef.current.scrollHeight + "px"; }
          }}
          onBlur={commitText}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitText(); }
            else if (e.key === "Escape") { setTextEdit(false); setTextAnnId(null); setTextVal(""); }
          }}
          placeholder="Ketik teks…"
          style={{
            position: "absolute",
            left: Math.max(0, textDomPos.x) + "px",
            top: Math.max(0, textDomPos.y) + "px",
            fontSize: `${fmt.fontSize}px`,
            lineHeight: 1.3,
            color: fmt.color,
            fontWeight: fmt.bold ? "bold" : "normal",
            fontStyle: fmt.italic ? "italic" : "normal",
            textDecoration: fmt.underline ? "underline" : "none",
            fontFamily: "Inter, Arial, sans-serif",
            minWidth: "160px",
            maxWidth: "420px",
            width: "auto",
            height: "auto",
            minHeight: `${fmt.fontSize + 12}px`,
            border: "2px solid #e64809",
            borderRadius: "5px",
            background: "rgba(255,255,255,0.97)",
            padding: "3px 7px",
            resize: "none",
            outline: "none",
            zIndex: 300,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(230,72,9,0.18)",
          }}
          rows={1}
        />
      )}
    </div>
  );
}

/* ─── Extract existing PDF text ───────────────────────────────────────────── */
async function extractPageText(pdf: pdfjsLib.PDFDocumentProxy, pageNum: number, scale: number): Promise<Annotation[]> {
  const page = await pdf.getPage(pageNum);
  const content = await page.getTextContent();
  const vp = page.getViewport({ scale });
  const result: Annotation[] = [];

  for (const item of content.items as any[]) {
    if (!item.str?.trim()) continue;
    const tx = pdfjsLib.Util.transform(vp.transform, item.transform);
    const x = tx[4];
    const y = tx[5];
    const fontSize = Math.max(Math.abs(tx[3]), 6);
    const font = (item.fontName || "").toLowerCase();

    result.push({
      id: `ext-${pageNum}-${x.toFixed(0)}-${y.toFixed(0)}-${Math.random().toString(36).slice(2,6)}`,
      type: "text", page: pageNum,
      x, y,
      width: Math.max((item.width || 0) * scale, fontSize * 0.5),
      height: fontSize * 1.4,
      content: item.str,
      color: "#000000",
      fontSize: Math.round(fontSize),
      bold: font.includes("bold"),
      italic: font.includes("italic") || font.includes("oblique"),
      underline: false,
      isExtracted: true,
    });
  }
  return result;
}

/* ─── Constants ────────────────────────────────────────────────────────────── */
const ZOOM_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

const TOOLS_CFG: { id: Tool; label: string; key: string; icon: React.ReactNode }[] = [
  { id: "select",    label: "Seleksi",   key: "V", icon: <MousePointer2 className="w-4 h-4" /> },
  { id: "text",      label: "Teks",      key: "T", icon: <Type className="w-4 h-4" /> },
  { id: "highlight", label: "Highlight", key: "H", icon: <Highlighter className="w-4 h-4" /> },
  { id: "draw",      label: "Gambar",    key: "D", icon: <Pencil className="w-4 h-4" /> },
  { id: "rectangle", label: "Persegi",   key: "R", icon: <Square className="w-4 h-4" /> },
  { id: "circle",    label: "Lingkaran", key: "O", icon: <Circle className="w-4 h-4" /> },
  { id: "line",      label: "Garis",     key: "L", icon: <Minus className="w-4 h-4" /> },
];

/* ─── Main page ────────────────────────────────────────────────────────────── */
export default function EditPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [fileAB, setFileAB]           = useState<ArrayBuffer | null>(null);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(0);
  const [tool, setTool]               = useState<Tool>("select");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [saveOk, setSaveOk]           = useState(false);
  const [zoomIdx, setZoomIdx]         = useState(2);
  const scale = ZOOM_STEPS[zoomIdx];
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const renderScale = isMobileViewport ? scale * 0.72 : scale;
  const [fmt, setFmt] = useState({ fontSize: 14, color: "#000000", bold: false, italic: false, underline: false });

  // ── Undo / Redo history ───────────────────────────────────────────────────
  const undoStack = useRef<Annotation[][]>([]);
  const redoStack = useRef<Annotation[][]>([]);
  // Reactive counters so disabled state on buttons updates correctly
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  /** Call this instead of setAnnotations whenever a user action should be undoable */
  const pushHistory = useCallback((prev: Annotation[], next: Annotation[]) => {
    undoStack.current.push(prev);
    // Cap stack at 100 entries
    if (undoStack.current.length > 100) undoStack.current.shift();
    redoStack.current = []; // clear redo on new action
    setAnnotations(next);
    setUndoCount(undoStack.current.length);
    setRedoCount(0);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop()!;
    redoStack.current.push(annotations);
    setAnnotations(prev);
    setSelectedId(null);
    setUndoCount(undoStack.current.length);
    setRedoCount(redoStack.current.length);
  }, [annotations]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    undoStack.current.push(annotations);
    setAnnotations(next);
    setSelectedId(null);
    setUndoCount(undoStack.current.length);
    setRedoCount(redoStack.current.length);
  }, [annotations]);

  const loadFile = useCallback(async (f: File) => {
    setFile(f); setSaveOk(false); setAnnotations([]);
    undoStack.current = []; redoStack.current = [];
    const ab = await f.arrayBuffer();
    setFileAB(ab);
    const pdf = await pdfjsLib.getDocument({ data: copyAB(ab) }).promise;
    setTotalPages(pdf.numPages);
    setPage(1);
    // Extract existing text from all pages at scale 1.0 (PDF coordinates)
    const all: Annotation[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await extractPageText(pdf, i, 1.0);
      all.push(...pg);
    }
    setAnnotations(all);
    pdf.destroy();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const syncViewport = () => setIsMobileViewport(window.innerWidth < 1024);
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && k === "z" && !e.shiftKey) {
        e.preventDefault(); undo(); return;
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (k === "y" || (k === "z" && e.shiftKey))) {
        e.preventDefault(); redo(); return;
      }

      // Don't fire single-key shortcuts when Ctrl/Meta is held
      if (e.ctrlKey || e.metaKey) return;

      if (k === "v") setTool("select");
      else if (k === "t") setTool("text");
      else if (k === "h") setTool("highlight");
      else if (k === "d") setTool("draw");
      else if (k === "r") setTool("rectangle");
      else if (k === "o") setTool("circle");
      else if (k === "l") setTool("line");
      else if ((k === "delete" || k === "backspace") && selectedId) {
        setAnnotations(prev => {
          const next = prev.filter(x => x.id !== selectedId);
          undoStack.current.push(prev);
          redoStack.current = [];
          return next;
        });
        setSelectedId(null);
      }
      else if (k === "+" || k === "=") setZoomIdx(i => Math.min(i + 1, ZOOM_STEPS.length - 1));
      else if (k === "-") setZoomIdx(i => Math.max(i - 1, 0));
      else if (k === "0") setZoomIdx(2);
      else if (k === "arrowleft") setPage(p => Math.max(1, p - 1));
      else if (k === "arrowright") setPage(p => Math.min(totalPages, p + 1));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selectedId, totalPages, undo, redo]);

  // Sync fmt when selecting text annotation
  useEffect(() => {
    if (!selectedId) return;
    const ann = annotations.find(a => a.id === selectedId);
    if (ann?.type === "text") {
      setFmt({ fontSize: ann.fontSize || 14, color: ann.color, bold: ann.bold || false, italic: ann.italic || false, underline: ann.underline || false });
    }
  }, [selectedId, annotations]);

  const updateFmt = (key: string, value: any) => {
    setFmt(p => ({ ...p, [key]: value }));
    if (selectedId) {
      setAnnotations(prev => {
        const next = prev.map(a => a.id === selectedId && a.type === "text" ? { ...a, [key]: value } : a);
        undoStack.current.push(prev);
        redoStack.current = [];
        return next;
      });
    }
  };

  const handleSave = async () => {
    if (!fileAB) return;
    setSaving(true); setSaveOk(false);
    try {
      const doc = await PDFDocument.load(fileAB);
      const pages = doc.getPages();
      const font = await doc.embedFont(StandardFonts.Helvetica);

      for (let i = 0; i < pages.length; i++) {
        const pg = pages[i];
        const ph = pg.getHeight();
        const anns = annotations.filter(a => a.page === i + 1 && !a.isExtracted);
        for (const ann of anns) {
          const c = hexRgb(ann.color);
          if (ann.type === "text") {
            pg.drawText(ann.content || "", { x: ann.x, y: ph - ann.y, size: ann.fontSize || 14, font, color: rgb(c.r, c.g, c.b) });
          } else if (ann.type === "highlight") {
            pg.drawRectangle({ x: ann.x, y: ph - ann.y - (ann.height || 20), width: ann.width || 200, height: ann.height || 20, color: rgb(c.r, c.g, c.b), opacity: 0.35 });
          } else if (ann.type === "draw" && ann.points) {
            for (let j = 0; j < ann.points.length - 1; j++) {
              pg.drawLine({ start: { x: ann.points[j].x, y: ph - ann.points[j].y }, end: { x: ann.points[j+1].x, y: ph - ann.points[j+1].y }, color: rgb(c.r, c.g, c.b), thickness: 2.5 });
            }
          } else if (ann.type === "rectangle" && ann.width && ann.height) {
            if (ann.fill) pg.drawRectangle({ x: ann.x, y: ph - ann.y - ann.height, width: ann.width, height: ann.height, color: rgb(c.r, c.g, c.b), opacity: 0.3 });
            pg.drawRectangle({ x: ann.x, y: ph - ann.y - ann.height, width: ann.width, height: ann.height, borderColor: rgb(c.r, c.g, c.b), borderWidth: 2 });
          } else if (ann.type === "circle" && ann.width && ann.height) {
            const cx = ann.x + ann.width / 2, cy = ph - ann.y - ann.height / 2;
            if (ann.fill) pg.drawEllipse({ x: cx, y: cy, xScale: ann.width/2, yScale: ann.height/2, color: rgb(c.r, c.g, c.b), opacity: 0.3 });
            pg.drawEllipse({ x: cx, y: cy, xScale: ann.width/2, yScale: ann.height/2, borderColor: rgb(c.r, c.g, c.b), borderWidth: 2 });
          } else if (ann.type === "line" && ann.points) {
            pg.drawLine({ start: { x: ann.points[0].x, y: ph - ann.points[0].y }, end: { x: ann.points[1].x, y: ph - ann.points[1].y }, color: rgb(c.r, c.g, c.b), thickness: 2.5 });
          }
        }
      }

      const bytes = await doc.save();
      const url = URL.createObjectURL(new Blob([bytes as any], { type: "application/pdf" }));
      const a = document.createElement("a"); a.href = url; a.download = "edited.pdf"; a.click();
      URL.revokeObjectURL(url);
      setSaveOk(true); setTimeout(() => setSaveOk(false), 3000);
    } catch { alert("Gagal menyimpan file"); }
    finally { setSaving(false); }
  };

  const selectedAnn = annotations.find(a => a.id === selectedId);
  const isTxtActive = tool === "text" || selectedAnn?.type === "text";
  const userAnnCount = annotations.filter(a => !a.isExtracted).length;

  if (!file) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen" style={{ background: "var(--bg)" }}>
          <Header activePath="/edit" />
          <main className="flex items-center justify-center min-h-[calc(100vh-60px)] p-6">
            <div className="w-full max-w-lg">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Pencil className="w-8 h-8 text-brand-500" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Edit PDF</h1>
                <p className="text-sm text-[var(--text-muted)]">Tambah teks, highlight, bentuk, dan anotasi. Teks yang ada dapat diklik dan diedit.</p>
              </div>
              <DropZone onFiles={f => loadFile(f[0])} accept="application/pdf" />
              <div className="mt-5 grid grid-cols-4 gap-2">
                {[
                  { icon: <Type className="w-4 h-4" />, label: "Tambah Teks" },
                  { icon: <Highlighter className="w-4 h-4" />, label: "Highlight" },
                  { icon: <Pencil className="w-4 h-4" />, label: "Gambar Bebas" },
                  { icon: <Square className="w-4 h-4" />, label: "Bentuk" },
                ].map(f => (
                  <div key={f.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-[var(--border)] text-center">
                    <span className="text-brand-500">{f.icon}</span>
                    <span className="text-xs font-medium text-[var(--text-muted)]">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
        <Header activePath="/edit" />

        {/* ── Toolbar ── */}
          <div className="bg-white border-b border-[var(--border)] px-3 sm:px-4 py-2 flex items-center gap-1 flex-wrap sticky top-[60px] z-40 shadow-sm">
          {/* Tools */}
          <div className="flex items-center gap-0.5 bg-[var(--bg)] rounded-xl p-1 mr-1">
            {TOOLS_CFG.map(t => (
              <button key={t.id} onClick={() => setTool(t.id)} title={`${t.label} (${t.key})`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tool === t.id ? "bg-brand-500 text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white"
                }`}>
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          <span className="w-px h-6 bg-[var(--border)] mx-0.5" />

          {/* Text formatting */}
          {isTxtActive && (
            <>
              <select value={fmt.fontSize} onChange={e => updateFmt("fontSize", parseInt(e.target.value))}
                className="input w-16 py-1 text-xs">
                {[8,9,10,11,12,14,16,18,20,22,24,28,32,36,40,48,56,64,72].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {[
                { key: "bold",      icon: <Bold className="w-4 h-4" />,      val: fmt.bold },
                { key: "italic",    icon: <Italic className="w-4 h-4" />,    val: fmt.italic },
                { key: "underline", icon: <Underline className="w-4 h-4" />, val: fmt.underline },
              ].map(f => (
                <button key={f.key} onClick={() => updateFmt(f.key, !f.val)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${f.val ? "bg-brand-100 text-brand-600" : "text-[var(--text-muted)] hover:bg-[var(--bg)]"}`}>
                  {f.icon}
                </button>
              ))}
              <input type="color" value={fmt.color} onChange={e => updateFmt("color", e.target.value)}
                className="w-8 h-8 rounded-lg border border-[var(--border)] cursor-pointer p-0.5 bg-white" title="Warna teks" />
              <span className="w-px h-6 bg-[var(--border)] mx-0.5" />
            </>
          )}

          {/* Delete */}
          {selectedId && (
            <button onClick={() => { setAnnotations(a => a.filter(x => x.id !== selectedId)); setSelectedId(null); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" title="Hapus (Delete)">
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 bg-[var(--bg)] rounded-xl p-1 ml-1">
            <button
              onClick={undo}
              disabled={undoStack.current.length === 0}
              title="Undo (Ctrl+Z)"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-white hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.current.length === 0}
              title="Redo (Ctrl+Y)"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-white hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1" />

          {/* Zoom */}
          <div className="flex items-center gap-0.5 bg-[var(--bg)] rounded-xl p-1">
            <button onClick={() => setZoomIdx(i => Math.max(i - 1, 0))} disabled={zoomIdx === 0}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-white disabled:opacity-40 transition-colors">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoomIdx(2)}
              className="px-2 py-1 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:bg-white min-w-[44px] text-center">
              {Math.round(scale * 100)}%
            </button>
            <button onClick={() => setZoomIdx(i => Math.min(i + 1, ZOOM_STEPS.length - 1))} disabled={zoomIdx === ZOOM_STEPS.length - 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-white disabled:opacity-40 transition-colors">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page nav */}
          <div className="hidden lg:flex items-center gap-0.5 bg-[var(--bg)] rounded-xl p-1 ml-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-white disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-[var(--text-muted)] px-1 min-w-[48px] text-center">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-white disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={handleSave} loading={saving} size="sm" className="ml-2"
            icon={saveOk ? <CheckCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            variant={saveOk ? "outline" : "brand"}>
            {saveOk ? "Tersimpan!" : "Simpan"}
          </Button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">

          {/* Thumbnails */}
          <div className="hidden lg:block w-[136px] flex-shrink-0 bg-white border-r border-[var(--border)] overflow-y-auto p-2 space-y-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <PageThumb key={n} arrayBuffer={fileAB} pageNumber={n} selected={page === n} onClick={() => setPage(n)} />
            ))}
          </div>

          {/* Mobile / tablet scroll stack */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:hidden"
            style={{ background: "repeating-linear-gradient(45deg,#ede9e4 0,#ede9e4 2px,var(--bg) 2px,var(--bg) 20px)" }}>
            <div className="max-w-full space-y-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <section
                  key={n}
                  onClick={() => setPage(n)}
                  className={`rounded-2xl border transition-all ${
                    page === n ? "border-brand-300 shadow-[0_12px_28px_-18px_rgba(230,72,9,.4)]" : "border-[var(--border)]"
                  } bg-white/50 backdrop-blur-sm p-2 sm:p-3`}
                >
                  <div className="flex items-center justify-between px-1 pb-2">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Halaman {n}</span>
                    {page === n && (
                      <span className="text-[10px] font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
                        Aktif
                      </span>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <div className="mx-auto w-max max-w-full shadow-[0_8px_40px_-8px_rgba(0,0,0,.18)] rounded-lg overflow-hidden">
                      <EditorCanvas arrayBuffer={fileAB} pageNumber={n} tool={tool}
                        annotations={annotations}
                        onAnnotationsChange={(next) => pushHistory(annotations, next)}
                        selectedId={selectedId} onSelect={setSelectedId}
                        scale={renderScale} fmt={fmt} onActivatePage={setPage} />
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>

          {/* Desktop canvas */}
          <div className="hidden lg:flex flex-1 overflow-auto p-3 sm:p-6 lg:p-8 justify-center items-start"
            style={{ background: "repeating-linear-gradient(45deg,#ede9e4 0,#ede9e4 2px,var(--bg) 2px,var(--bg) 20px)" }}>
            <div className="shadow-[0_8px_40px_-8px_rgba(0,0,0,.18)] rounded-lg overflow-hidden">
              <EditorCanvas arrayBuffer={fileAB} pageNumber={page} tool={tool}
                annotations={annotations}
                onAnnotationsChange={(next) => pushHistory(annotations, next)}
                selectedId={selectedId} onSelect={setSelectedId}
                scale={renderScale} fmt={fmt} onActivatePage={setPage} />
            </div>
          </div>

          {/* Properties */}
          <div className="hidden xl:flex w-60 flex-shrink-0 bg-white border-l border-[var(--border)] flex-col overflow-y-auto">
            <div className="px-4 pt-4 pb-3 border-b border-[var(--border)]">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Properties</p>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* File */}
              <div>
                <p className="label">File</p>
                <div className="card p-3">
                  <p className="text-xs font-semibold text-[var(--text)] truncate">{file.name}</p>
                  <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">{totalPages} hal · {Math.round(file.size / 1024)} KB</p>
                </div>
              </div>
              {/* Annotations */}
              <div>
                <p className="label">Anotasi</p>
                <div className="card p-3 space-y-1">
                  <p className="text-xs text-[var(--text-muted)]"><span className="font-bold text-brand-500 text-sm">{userAnnCount}</span> anotasi baru</p>
                  <p className="text-[11px] text-[var(--text-subtle)]">{annotations.filter(a => a.page === page && !a.isExtracted).length} di halaman ini</p>
                  <p className="text-[11px] text-[var(--text-subtle)]">{annotations.filter(a => a.isExtracted).length} teks asli terdeteksi</p>
                </div>
              </div>
              {/* Selected */}
              {selectedAnn && (
                <div>
                  <p className="label">Dipilih</p>
                  <div className="card p-3 space-y-3">
                    {selectedAnn.isExtracted && (
                      <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-2 py-1">Teks asli PDF — klik untuk edit</p>
                    )}
                    <div>
                      <p className="text-[11px] text-[var(--text-subtle)] mb-1">Warna</p>
                      <input type="color" value={selectedAnn.color}
                        onChange={e => setAnnotations(p => p.map(a => a.id === selectedId ? { ...a, color: e.target.value, isExtracted: false } : a))}
                        className="w-full h-8 rounded-lg border border-[var(--border)] cursor-pointer" />
                    </div>
                    {["rectangle","circle","highlight"].includes(selectedAnn.type) && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selectedAnn.fill || false}
                          onChange={e => setAnnotations(p => p.map(a => a.id === selectedId ? { ...a, fill: e.target.checked } : a))}
                          className="w-4 h-4 accent-brand-500 rounded" />
                        <span className="text-xs font-medium text-[var(--text-muted)]">Isi bentuk</span>
                      </label>
                    )}
                    <button onClick={() => { setAnnotations(a => a.filter(x => x.id !== selectedId)); setSelectedId(null); }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </div>
              )}
              {/* Shortcuts */}
              <div>
                <p className="label">Pintasan Keyboard</p>
                <div className="space-y-1">
                  {[["V","Seleksi"],["T","Teks"],["H","Highlight"],["D","Gambar"],["R","Persegi"],["O","Lingkaran"],["+/-","Zoom"],["← →","Halaman"],["Del","Hapus"]].map(([k,l]) => (
                    <div key={k} className="flex items-center justify-between py-0.5">
                      <span className="text-[11px] text-[var(--text-muted)]">{l}</span>
                      <kbd className="text-[10px] font-mono font-semibold bg-[var(--bg)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[var(--text-subtle)]">{k}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border)]">
              <Button onClick={handleSave} loading={saving} fullWidth size="md"
                icon={saveOk ? <CheckCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                variant={saveOk ? "outline" : "brand"}>
                {saveOk ? "Tersimpan!" : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function hexRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1],16)/255, g: parseInt(r[2],16)/255, b: parseInt(r[3],16)/255 } : { r:0,g:0,b:0 };
}
