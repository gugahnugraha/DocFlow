"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { 
  Upload, 
  FileType, 
  Loader2, 
  MousePointer2, 
  Type, 
  Highlighter, 
  Pencil, 
  Trash2,
  Save,
  ChevronLeft,
  ChevronRight,
  Layout,
  Bold,
  Italic,
  Underline,
  Square,
  Circle,
  Minus,
  Image as ImageIcon,
  AlignLeft
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const copyArrayBuffer = (buffer: ArrayBuffer) => {
  const copy = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(copy).set(new Uint8Array(buffer));
  return copy;
};

type Tool = "select" | "text" | "highlight" | "draw" | "rectangle" | "circle" | "line";

interface Annotation {
  id: string;
  type: "text" | "highlight" | "draw" | "rectangle" | "circle" | "line";
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  points?: { x: number; y: number }[];
  fill?: boolean;
  fillColor?: string;
}

interface PageData {
  number: number;
  scale: number;
  viewport: pdfjsLib.PageViewport;
}

function PdfPageThumbnail({
  arrayBuffer,
  pageNumber,
  selected,
  onClick,
}: {
  arrayBuffer: ArrayBuffer | null;
  pageNumber: number;
  selected: boolean;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!arrayBuffer) return;

    let isSubscribed = true;
    let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;

    const loadPreview = async () => {
      try {
        if (!arrayBuffer) return;
        pdfDoc = await pdfjsLib.getDocument({ data: copyArrayBuffer(arrayBuffer) }).promise;
        if (!isSubscribed) {
          pdfDoc.destroy();
          return;
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (!isSubscribed) {
          pdfDoc.destroy();
          return;
        }

        const scale = 0.3;
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        if (!canvas) {
          pdfDoc.destroy();
          return;
        }
        
        const context = canvas.getContext("2d");
        if (!context) {
          pdfDoc.destroy();
          return;
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        renderTaskRef.current = page.render({ canvasContext: context, viewport });
        await renderTaskRef.current.promise;

        if (!isSubscribed) {
          pdfDoc.destroy();
          return;
        }

        setIsLoading(false);
        pdfDoc.destroy();
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
    };
  }, [arrayBuffer, pageNumber]);

  return (
    <div 
      className={`cursor-pointer transition-all ${
        selected ? 'ring-2 ring-red-500 ring-offset-2' : 'hover:ring-2 hover:ring-slate-300 hover:ring-offset-2'
      }`}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="w-40 h-48 bg-slate-100 rounded-lg flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
        </div>
      ) : (
        <canvas ref={canvasRef} className="w-40 h-auto rounded-lg bg-white border border-slate-200" />
      )}
      <div className="text-center mt-1 text-sm font-medium text-slate-600">{pageNumber}</div>
    </div>
  );
}

function PdfEditorCanvas({
  arrayBuffer,
  pageNumber,
  currentTool,
  annotations,
  onAnnotationsChange,
  selectedAnnotationId,
  onSelectAnnotation,
  scale,
  textFormat,
  onTextFormatChange,
}: {
  arrayBuffer: ArrayBuffer | null;
  pageNumber: number;
  currentTool: Tool;
  annotations: Annotation[];
  onAnnotationsChange: (annotations: Annotation[]) => void;
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  scale: number;
  textFormat: { fontSize: number; color: string; bold: boolean; italic: boolean; underline: boolean };
  onTextFormatChange: (format: any) => void;
}) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [tempShapeStart, setTempShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [tempShapeEnd, setTempShapeEnd] = useState<{ x: number; y: number } | null>(null);

  // Load PDF page
  useEffect(() => {
    if (!arrayBuffer || !pdfCanvasRef.current) return;

    let isSubscribed = true;
    let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;

    const loadPage = async () => {
      try {
        if (!arrayBuffer) return;
        pdfDoc = await pdfjsLib.getDocument({ data: copyArrayBuffer(arrayBuffer) }).promise;
        if (!isSubscribed) {
          pdfDoc.destroy();
          return;
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (!isSubscribed) {
          pdfDoc.destroy();
          return;
        }

        const viewport = page.getViewport({ scale });
        setPageData({ number: pageNumber, scale, viewport });

        const canvas = pdfCanvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        renderTaskRef.current = page.render({ canvasContext: context, viewport });
        await renderTaskRef.current.promise;

        if (!isSubscribed) {
          if (pdfDoc) pdfDoc.destroy();
          return;
        }

        if (pdfDoc) pdfDoc.destroy();
      } catch (err) {
        console.error(`Failed to load page ${pageNumber}:`, err);
      }
    };

    loadPage();

    return () => {
      isSubscribed = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [arrayBuffer, pageNumber, scale]);

  // Redraw annotations
  useEffect(() => {
    if (!drawCanvasRef.current || !pageData) return;
    const ctx = drawCanvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);

    annotations.filter(a => a.page === pageNumber).forEach(annotation => {
      ctx.strokeStyle = annotation.color;
      ctx.fillStyle = annotation.fillColor || annotation.color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (annotation.type === "text") {
        ctx.font = `${annotation.bold ? "bold" : ""} ${annotation.italic ? "italic" : ""} ${annotation.fontSize || 16}px Arial, sans-serif`;
        ctx.fillStyle = annotation.color;
        if (annotation.content) {
          ctx.fillText(annotation.content, annotation.x, annotation.y);
          if (annotation.underline) {
            const textWidth = ctx.measureText(annotation.content).width;
            ctx.beginPath();
            ctx.moveTo(annotation.x, annotation.y + 3);
            ctx.lineTo(annotation.x + textWidth, annotation.y + 3);
            ctx.stroke();
          }
        }
      } else if (annotation.type === "highlight") {
        ctx.globalAlpha = 0.4;
        if (annotation.width && annotation.height) {
          ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
        }
        ctx.globalAlpha = 1;
      } else if (annotation.type === "draw" && annotation.points) {
        ctx.beginPath();
        annotation.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else if (annotation.type === "rectangle") {
        if (annotation.fill) {
          ctx.globalAlpha = 0.4;
          if (annotation.width && annotation.height) {
            ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
          }
          ctx.globalAlpha = 1;
        }
        if (annotation.width && annotation.height) {
          ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
        }
      } else if (annotation.type === "circle") {
        if (annotation.width && annotation.height) {
          const centerX = annotation.x + annotation.width / 2;
          const centerY = annotation.y + annotation.height / 2;
          const radiusX = annotation.width / 2;
          const radiusY = annotation.height / 2;
          
          if (annotation.fill) {
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
          ctx.stroke();
        }
      } else if (annotation.type === "line" && annotation.points) {
        ctx.beginPath();
        ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
        ctx.lineTo(annotation.points[1].x, annotation.points[1].y);
        ctx.stroke();
      }

      // Selection box
      if (annotation.id === selectedAnnotationId) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        if (annotation.width && annotation.height) {
          ctx.strokeRect(annotation.x - 5, annotation.y - 5, annotation.width + 10, annotation.height + 10);
        } else if (annotation.type === "text" && annotation.content) {
          const textWidth = ctx.measureText(annotation.content).width;
          ctx.strokeRect(annotation.x - 5, annotation.y - (annotation.fontSize || 16) - 5, textWidth + 10, (annotation.fontSize || 16) + 15);
        }
        ctx.setLineDash([]);
      }
    });

    // Draw temporary shape
    if (tempShapeStart && tempShapeEnd) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      const width = tempShapeEnd.x - tempShapeStart.x;
      const height = tempShapeEnd.y - tempShapeStart.y;

      if (currentTool === "rectangle") {
        ctx.strokeRect(tempShapeStart.x, tempShapeStart.y, width, height);
      } else if (currentTool === "circle") {
        const centerX = tempShapeStart.x + width / 2;
        const centerY = tempShapeStart.y + height / 2;
        const radiusX = Math.abs(width / 2);
        const radiusY = Math.abs(height / 2);
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (currentTool === "line") {
        ctx.beginPath();
        ctx.moveTo(tempShapeStart.x, tempShapeStart.y);
        ctx.lineTo(tempShapeEnd.x, tempShapeEnd.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  }, [annotations, pageNumber, pageData, selectedAnnotationId, tempShapeStart, tempShapeEnd, currentTool]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isTextEditing) return;
    
    const pos = getMousePos(e);

    if (currentTool === "select") {
      let found = false;
      for (let i = annotations.length - 1; i >= 0; i--) {
        const ann = annotations[i];
        if (ann.page === pageNumber) {
          let hitBox = { x: ann.x - 10, y: ann.y - 10, w: 20, h: 20 };
          if (ann.width && ann.height) {
            hitBox = { x: ann.x - 10, y: ann.y - 10, w: ann.width + 20, h: ann.height + 20 };
          } else if (ann.type === "text" && ann.content && drawCanvasRef.current) {
            const ctx = drawCanvasRef.current.getContext("2d");
            if (ctx) {
              const textWidth = ctx.measureText(ann.content).width;
              hitBox = { x: ann.x - 10, y: ann.y - (ann.fontSize || 16) - 10, w: textWidth + 20, h: (ann.fontSize || 16) + 20 };
            }
          }

          if (
            pos.x >= hitBox.x &&
            pos.x <= hitBox.x + hitBox.w &&
            pos.y >= hitBox.y &&
            pos.y <= hitBox.y + hitBox.h
          ) {
            onSelectAnnotation(ann.id);
            if (ann.type === "text") {
              startTextEdit(ann.id, ann.content || "", ann.x, ann.y);
            }
            found = true;
            break;
          }
        }
      }
      if (!found) {
        onSelectAnnotation(null);
        setIsTextEditing(false);
      }
    } else if (currentTool === "draw") {
      setIsDrawing(true);
      setCurrentPoints([pos]);
    } else if (["rectangle", "circle", "line"].includes(currentTool)) {
      setTempShapeStart(pos);
      setTempShapeEnd(pos);
    } else if (currentTool === "text") {
      startTextEdit(null, "", pos.x, pos.y);
    } else if (currentTool === "highlight") {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: "highlight",
        page: pageNumber,
        x: pos.x,
        y: pos.y,
        width: 200,
        height: 50,
        color: textFormat.color,
        fill: true,
      };
      onAnnotationsChange([...annotations, newAnnotation]);
      onSelectAnnotation(newAnnotation.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isTextEditing) return;
    const pos = getMousePos(e);

    if (isDrawing && currentTool === "draw") {
      setCurrentPoints(prev => [...prev, pos]);
    } else if (tempShapeStart && ["rectangle", "circle", "line"].includes(currentTool)) {
      setTempShapeEnd(pos);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentTool === "draw" && currentPoints.length > 1) {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: "draw",
        page: pageNumber,
        x: currentPoints[0].x,
        y: currentPoints[0].y,
        color: textFormat.color,
        points: currentPoints,
      };
      onAnnotationsChange([...annotations, newAnnotation]);
      onSelectAnnotation(newAnnotation.id);
      setCurrentPoints([]);
    } else if (tempShapeStart && tempShapeEnd) {
      if (currentTool === "rectangle") {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: "rectangle",
          page: pageNumber,
          x: Math.min(tempShapeStart.x, tempShapeEnd.x),
          y: Math.min(tempShapeStart.y, tempShapeEnd.y),
          width: Math.abs(tempShapeEnd.x - tempShapeStart.x),
          height: Math.abs(tempShapeEnd.y - tempShapeStart.y),
          color: textFormat.color,
          fill: false,
        };
        onAnnotationsChange([...annotations, newAnnotation]);
        onSelectAnnotation(newAnnotation.id);
      } else if (currentTool === "circle") {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: "circle",
          page: pageNumber,
          x: Math.min(tempShapeStart.x, tempShapeEnd.x),
          y: Math.min(tempShapeStart.y, tempShapeEnd.y),
          width: Math.abs(tempShapeEnd.x - tempShapeStart.x),
          height: Math.abs(tempShapeEnd.y - tempShapeStart.y),
          color: textFormat.color,
          fill: false,
        };
        onAnnotationsChange([...annotations, newAnnotation]);
        onSelectAnnotation(newAnnotation.id);
      } else if (currentTool === "line") {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: "line",
          page: pageNumber,
          x: tempShapeStart.x,
          y: tempShapeStart.y,
          color: textFormat.color,
          points: [tempShapeStart, tempShapeEnd],
        };
        onAnnotationsChange([...annotations, newAnnotation]);
        onSelectAnnotation(newAnnotation.id);
      }
      setTempShapeStart(null);
      setTempShapeEnd(null);
    }
    setIsDrawing(false);
  };

  const startTextEdit = (id: string | null, text: string, x: number, y: number) => {
    setEditingAnnotationId(id);
    setEditingText(text);
    setTextPosition({ x, y });
    setIsTextEditing(true);
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 0);
  };

  const finishTextEdit = () => {
    if (editingText.trim()) {
      if (editingAnnotationId) {
        onAnnotationsChange(annotations.map(a => 
          a.id === editingAnnotationId 
            ? { ...a, content: editingText }
            : a
        ));
      } else {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: "text",
          page: pageNumber,
          x: textPosition.x,
          y: textPosition.y,
          width: 200,
          height: 30,
          content: editingText,
          color: textFormat.color,
          fontSize: textFormat.fontSize,
          bold: textFormat.bold,
          italic: textFormat.italic,
          underline: textFormat.underline,
        };
        onAnnotationsChange([...annotations, newAnnotation]);
        onSelectAnnotation(newAnnotation.id);
      }
    }
    setIsTextEditing(false);
    setEditingAnnotationId(null);
    setEditingText("");
  };

  return (
    <div className="relative inline-block">
      <canvas
        ref={pdfCanvasRef}
        className="absolute top-0 left-0"
      />
      <canvas
        ref={drawCanvasRef}
        className="relative z-10 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {isTextEditing && (
        <textarea
          ref={textInputRef}
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onBlur={finishTextEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              finishTextEdit();
            } else if (e.key === "Escape") {
              setIsTextEditing(false);
            }
          }}
          style={{
            position: "absolute",
            left: textPosition.x,
            top: textPosition.y - textFormat.fontSize,
            width: "auto",
            minWidth: "100px",
            maxWidth: "500px",
            height: "auto",
            fontSize: `${textFormat.fontSize}px`,
            color: textFormat.color,
            fontWeight: textFormat.bold ? "bold" : "normal",
            fontStyle: textFormat.italic ? "italic" : "normal",
            textDecoration: textFormat.underline ? "underline" : "none",
            border: "2px solid #3b82f6",
            backgroundColor: "rgba(255,255,255,0.95)",
            padding: "2px 4px",
            resize: "none",
            outline: "none",
            zIndex: 100,
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
          rows={1}
        />
      )}
    </div>
  );
}

export default function EditPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileArrayBuffer, setFileArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentTool, setCurrentTool] = useState<Tool>("select");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnnotateTab, setIsAnnotateTab] = useState(true);
  const [textFormat, setTextFormat] = useState({
    fontSize: 16,
    color: "#000000",
    bold: false,
    italic: false,
    underline: false,
  });

  // Extract text from PDF using pdf.js
  const extractTextFromPage = async (
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    scale: number
  ) => {
    const page = await pdfDoc.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale });

    const extractedAnnotations: Annotation[] = [];
    (textContent.items as any[]).forEach((item, index) => {
      const transform = item.transform; // [scaleX, skewY, skewX, scaleY, translateX, translateY]
      const fontSize = transform[3]; // scaleY is usually font size
      
      // Determine position - pdf.js y is bottom-up
      const x = transform[4];
      const y = viewport.height - transform[5];
      
      // Check for bold/italic in font name
      const fontName = item.fontName?.toLowerCase() || "";
      const isBold = fontName.includes("bold");
      const isItalic = fontName.includes("italic") || fontName.includes("oblique");

      // Calculate approximate width
      const width = item.width * scale || fontSize * item.str.length * 0.6;

      extractedAnnotations.push({
        id: `extracted-text-${pageNumber}-${index}`,
        type: "text",
        page: pageNumber,
        x: x,
        y: y,
        width: width,
        height: fontSize * 1.2,
        content: item.str,
        color: "#000000",
        fontSize: fontSize,
        bold: isBold,
        italic: isItalic,
        underline: false,
      });
    });

    return extractedAnnotations;
  };

  const onDrop = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(selectedFile);
    });
    setFileArrayBuffer(arrayBuffer);
    const pdf = await pdfjsLib.getDocument({ data: copyArrayBuffer(arrayBuffer) }).promise;
    const numPages = pdf.numPages;
    setTotalPages(numPages);
    setCurrentPage(1);

    // Extract text from all pages
    const allExtractedAnnotations: Annotation[] = [];
    for (let i = 1; i <= numPages; i++) {
      const pageAnnotations = await extractTextFromPage(pdf, i, 1.2);
      allExtractedAnnotations.push(...pageAnnotations);
    }
    setAnnotations(allExtractedAnnotations);
    pdf.destroy();
  }, []);

  const deleteSelectedAnnotation = () => {
    if (selectedAnnotationId) {
      setAnnotations(annotations.filter(a => a.id !== selectedAnnotationId));
      setSelectedAnnotationId(null);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0, g: 0, b: 0 };
  };

  const handleSave = async () => {
    if (!fileArrayBuffer) return;
    setIsSaving(true);
    try {
      const pdfDoc = await PDFDocument.load(fileArrayBuffer);
      const pages = pdfDoc.getPages();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pageNumber = i + 1;
        const pageAnnotations = annotations.filter(a => a.page === pageNumber);
        const pageHeight = page.getHeight();

        for (const annotation of pageAnnotations) {
          const color = hexToRgb(annotation.color);

          if (annotation.type === "text") {
            page.drawText(annotation.content || "", {
              x: annotation.x,
              y: pageHeight - annotation.y,
              size: annotation.fontSize || 16,
              font: helveticaFont,
              color: rgb(color.r, color.g, color.b),
            });
          } else if (annotation.type === "highlight") {
            page.drawRectangle({
              x: annotation.x,
              y: pageHeight - annotation.y - (annotation.height || 50),
              width: annotation.width || 200,
              height: annotation.height || 50,
              color: rgb(color.r, color.g, color.b),
              opacity: 0.4,
            });
          } else if (annotation.type === "draw" && annotation.points) {
            if (annotation.points.length > 1) {
              for (let j = 0; j < annotation.points.length - 1; j++) {
                const start = annotation.points[j];
                const end = annotation.points[j + 1];
                page.drawLine({
                  start: { x: start.x, y: pageHeight - start.y },
                  end: { x: end.x, y: pageHeight - end.y },
                  color: rgb(color.r, color.g, color.b),
                  thickness: 3,
                });
              }
            }
          } else if (annotation.type === "rectangle") {
            if (annotation.fill) {
              page.drawRectangle({
                x: annotation.x,
                y: pageHeight - annotation.y - (annotation.height || 0),
                width: annotation.width || 0,
                height: annotation.height || 0,
                color: rgb(color.r, color.g, color.b),
                opacity: 0.4,
              });
            }
            page.drawRectangle({
              x: annotation.x,
              y: pageHeight - annotation.y - (annotation.height || 0),
              width: annotation.width || 0,
              height: annotation.height || 0,
              borderColor: rgb(color.r, color.g, color.b),
              borderWidth: 3,
            });
          } else if (annotation.type === "circle") {
            if (annotation.width && annotation.height) {
              const centerX = annotation.x + annotation.width / 2;
              const centerY = pageHeight - annotation.y - annotation.height / 2;
              const radiusX = annotation.width / 2;
              const radiusY = annotation.height / 2;
              if (annotation.fill) {
                page.drawEllipse({
                  x: centerX,
                  y: centerY,
                  xSemiAxis: radiusX,
                  ySemiAxis: radiusY,
                  color: rgb(color.r, color.g, color.b),
                  opacity: 0.4,
                });
              }
              page.drawEllipse({
                x: centerX,
                y: centerY,
                xSemiAxis: radiusX,
                ySemiAxis: radiusY,
                borderColor: rgb(color.r, color.g, color.b),
                borderWidth: 3,
              });
            }
          } else if (annotation.type === "line" && annotation.points) {
            page.drawLine({
              start: { x: annotation.points[0].x, y: pageHeight - annotation.points[0].y },
              end: { x: annotation.points[1].x, y: pageHeight - annotation.points[1].y },
              color: rgb(color.r, color.g, color.b),
              thickness: 3,
            });
          }
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "edited.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan file");
    } finally {
      setIsSaving(false);
    }
  };

  // Update text format when selecting text annotation
  useEffect(() => {
    if (selectedAnnotationId) {
      const ann = annotations.find(a => a.id === selectedAnnotationId);
      if (ann && ann.type === "text") {
        setTextFormat({
          fontSize: ann.fontSize || 16,
          color: ann.color,
          bold: ann.bold || false,
          italic: ann.italic || false,
          underline: ann.underline || false,
        });
      }
    }
  }, [selectedAnnotationId, annotations]);

  // Update selected annotation's text format
  const updateSelectedAnnotationFormat = (key: string, value: any) => {
    if (selectedAnnotationId) {
      setAnnotations(annotations.map(a => 
        a.id === selectedAnnotationId && a.type === "text"
          ? { ...a, [key]: value }
          : a
      ));
    }
    setTextFormat(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
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
              <a href="/compress" className="text-slate-700 font-semibold hover:text-slate-900">Compress PDF</a>
              <a href="/edit" className="text-red-600 font-semibold border-b-2 border-red-600 pb-1">Edit PDF</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-slate-700 font-semibold hover:text-slate-900">Login</button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors">Sign up</button>
          </div>
        </div>
      </header>

      {!file ? (
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white rounded-2xl p-10 shadow-sm max-w-md w-full">
              <div className="bg-red-50 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <FileType className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Edit PDF</h2>
              <p className="text-slate-500 mb-8">Tambahkan teks, highlight, gambar, dan anotasi pada PDF Anda</p>
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
        </main>
      ) : (
        <main className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="bg-white border-b border-slate-200 px-4 py-2">
            {/* Annotate / Edit Tabs */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setIsAnnotateTab(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isAnnotateTab ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Pencil className="w-4 h-4" />
                Annotate
              </button>
              <button
                onClick={() => setIsAnnotateTab(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  !isAnnotateTab ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <AlignLeft className="w-4 h-4" />
                Edit
              </button>
            </div>

            {/* Tools */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentTool("select")}
                className={`p-2 rounded-lg transition-all ${
                  currentTool === "select"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                title="Select"
              >
                <MousePointer2 className="w-5 h-5" />
              </button>

              {isAnnotateTab ? (
                <>
                  <div className="w-px h-8 bg-slate-200 mx-1" />
                  <button
                    onClick={() => setCurrentTool("text")}
                    className={`p-2 rounded-lg transition-all ${
                      currentTool === "text"
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title="Add Text"
                  >
                    <Type className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentTool("highlight")}
                    className={`p-2 rounded-lg transition-all ${
                      currentTool === "highlight"
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title="Highlight"
                  >
                    <Highlighter className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentTool("draw")}
                    className={`p-2 rounded-lg transition-all ${
                      currentTool === "draw"
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title="Draw"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <div className="w-px h-8 bg-slate-200 mx-1" />
                  <button
                    onClick={() => setCurrentTool("rectangle")}
                    className={`p-2 rounded-lg transition-all ${
                      currentTool === "rectangle"
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title="Rectangle"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentTool("circle")}
                    className={`p-2 rounded-lg transition-all ${
                      currentTool === "circle"
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title="Circle"
                  >
                    <Circle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentTool("line")}
                    className={`p-2 rounded-lg transition-all ${
                      currentTool === "line"
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title="Line"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="w-px h-8 bg-slate-200 mx-1" />
                  <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg" title="Add Image">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-px h-8 bg-slate-200 mx-1" />
                  <span className="text-slate-500 text-sm px-2">Edit tools coming soon...</span>
                </>
              )}

              {selectedAnnotationId && (
                <>
                  <div className="w-px h-8 bg-slate-200 mx-1" />
                  <button
                    onClick={deleteSelectedAnnotation}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Text Formatting */}
              {isAnnotateTab && (currentTool === "text" || (selectedAnnotationId && annotations.find(a => a.id === selectedAnnotationId)?.type === "text")) && (
                <>
                  <div className="w-px h-8 bg-slate-200 mx-1" />
                  <select
                    value={textFormat.fontSize}
                    onChange={(e) => updateSelectedAnnotationFormat("fontSize", parseInt(e.target.value))}
                    className="px-2 py-1 border border-slate-300 rounded-lg text-sm"
                  >
                    {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => updateSelectedAnnotationFormat("bold", !textFormat.bold)}
                    className={`p-2 rounded-lg transition-colors ${textFormat.bold ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Bold className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateSelectedAnnotationFormat("italic", !textFormat.italic)}
                    className={`p-2 rounded-lg transition-colors ${textFormat.italic ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Italic className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateSelectedAnnotationFormat("underline", !textFormat.underline)}
                    className={`p-2 rounded-lg transition-colors ${textFormat.underline ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Underline className="w-5 h-5" />
                  </button>
                  <input
                    type="color"
                    value={textFormat.color}
                    onChange={(e) => updateSelectedAnnotationFormat("color", e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                </>
              )}

              <div className="flex-1" />

              {/* Page Navigation */}
              <div className="flex items-center gap-2 mr-4">
                <button
                  onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-slate-700 font-medium text-sm">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save changes
              </button>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Left Sidebar - Page Thumbnails */}
            <div className="w-52 bg-white border-r border-slate-200 p-4 overflow-y-auto">
              <div className="flex flex-col gap-3">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PdfPageThumbnail
                    key={page}
                    arrayBuffer={fileArrayBuffer}
                    pageNumber={page}
                    selected={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                  />
                ))}
              </div>
            </div>

            {/* Middle - Canvas Area */}
            <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-200">
              <PdfEditorCanvas
                arrayBuffer={fileArrayBuffer}
                pageNumber={currentPage}
                currentTool={currentTool}
                annotations={annotations}
                onAnnotationsChange={setAnnotations}
                selectedAnnotationId={selectedAnnotationId}
                onSelectAnnotation={setSelectedAnnotationId}
                scale={1.2}
                textFormat={textFormat}
                onTextFormatChange={setTextFormat}
              />
            </div>

            {/* Right Sidebar - Properties */}
            <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Edit PDF</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  Use the toolbar to modify or add text, upload images, and annotate with ease.
                </p>
              </div>
              {selectedAnnotationId && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Layout className="w-5 h-5 text-slate-600" />
                    <span className="font-semibold text-slate-700">Properties</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                    <input
                      type="color"
                      className="w-full h-10 rounded cursor-pointer"
                      value={annotations.find(a => a.id === selectedAnnotationId)?.color || "#000000"}
                      onChange={(e) => {
                        setAnnotations(annotations.map(a => 
                          a.id === selectedAnnotationId ? { ...a, color: e.target.value } : a
                        ));
                      }}
                    />
                  </div>
                  {["rectangle", "circle", "highlight"].includes(annotations.find(a => a.id === selectedAnnotationId)?.type || "") && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={annotations.find(a => a.id === selectedAnnotationId)?.fill || false}
                          onChange={(e) => {
                            setAnnotations(annotations.map(a => 
                              a.id === selectedAnnotationId ? { ...a, fill: e.target.checked } : a
                            ));
                          }}
                          className="w-4 h-4 rounded"
                        />
                        Fill
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
