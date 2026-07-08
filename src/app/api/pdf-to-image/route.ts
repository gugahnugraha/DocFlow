import { NextRequest, NextResponse } from "next/server";
import { pathToFileURL } from "url";
import { resolve } from "path";
import JSZip from "jszip";

export const runtime = "nodejs";
export const maxDuration = 60;

// Resolve worker + font paths once at module load (server-side only)
const WORKER_SRC = pathToFileURL(
  resolve(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
).toString();

const FONT_DATA_URL =
  pathToFileURL(
    resolve(process.cwd(), "node_modules/pdfjs-dist/standard_fonts/")
  ).toString() + "/";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file      = formData.get("file") as File;
    const format    = (formData.get("format") as string) || "jpg";
    const dpi       = Math.min(parseInt(formData.get("dpi") as string) || 150, 300);
    const pagesStr  = formData.get("pages") as string;

    if (!file) {
      return NextResponse.json({ error: "File PDF diperlukan" }, { status: 400 });
    }

    // ── pdfjs (legacy Node build) ──────────────────────────────────────────
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs" as any);
    pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;

    const data = new Uint8Array(await file.arrayBuffer());
    const pdf  = await pdfjsLib.getDocument({
      data,
      standardFontDataUrl: FONT_DATA_URL,
    }).promise;

    const totalPages: number = pdf.numPages;

    const pageNumbers: number[] =
      !pagesStr || pagesStr === "all"
        ? Array.from({ length: totalPages }, (_, i) => i + 1)
        : JSON.parse(pagesStr);

    // ── @napi-rs/canvas for real rendering ────────────────────────────────
    const { createCanvas } = await import("@napi-rs/canvas");
    const scale = dpi / 72;
    const ext   = format === "png" ? "png" : "jpg";
    const zip   = new JSZip();

    for (const pageNum of pageNumbers) {
      if (pageNum < 1 || pageNum > totalPages) continue;

      const page     = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const w        = Math.round(viewport.width);
      const h        = Math.round(viewport.height);

      const canvas = createCanvas(w, h);
      const ctx    = canvas.getContext("2d") as any;

      // White background (important for JPEG transparency)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);

      // Render with proper viewport and context
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        intent: "print" as any,
      };

      try {
        const renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (renderErr: any) {
        console.error(`[pdf-to-image] page ${pageNum} render error:`, renderErr);
        // Continue with other pages even if one fails
      }

      const imgBuf: Buffer =
        format === "png"
          ? await canvas.encode("png")
          : await canvas.encode("jpeg", 92);

      zip.file(`page_${pageNum}.${ext}`, imgBuf);
    }

    pdf.destroy();

    // Single page → return image directly
    if (pageNumbers.length === 1) {
      const pg  = pageNumbers[0];
      const obj = zip.files[`page_${pg}.${ext}`];
      if (obj) {
        const buf = await obj.async("nodebuffer");
        return new NextResponse(buf as any, {
          headers: {
            "Content-Type": format === "png" ? "image/png" : "image/jpeg",
            "Content-Disposition": `attachment; filename="page_${pg}.${ext}"`,
          },
        });
      }
    }

    const zipBuf = await zip.generateAsync({ type: "nodebuffer" });
    return new NextResponse(zipBuf as any, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="pdf_images.zip"',
      },
    });
  } catch (err) {
    console.error("[pdf-to-image]", err);
    return NextResponse.json({ error: "Gagal mengkonversi PDF" }, { status: 500 });
  }
}
