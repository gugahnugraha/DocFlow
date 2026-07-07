import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const format = (formData.get("format") as string) || "jpg";
    const dpi = parseInt(formData.get("dpi") as string) || 150;
    const pagesStr = formData.get("pages") as string;

    if (!file) {
      return NextResponse.json({ error: "File PDF diperlukan" }, { status: 400 });
    }

    // ── Load pdfjs (legacy build for Node.js, no browser Worker needed) ──
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs" as any);
    // Disable the worker in Node — pdfjs legacy build can run single-threaded
    pdfjsLib.GlobalWorkerOptions.workerSrc = "";

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      // Node.js: disable worker
      disableWorker: true,
      isEvalSupported: false,
    }).promise;

    const totalPages: number = pdf.numPages;

    let pageNumbers: number[];
    if (!pagesStr || pagesStr === "all") {
      pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      pageNumbers = JSON.parse(pagesStr);
    }

    // ── Import @napi-rs/canvas for real canvas rendering ──
    const { createCanvas } = await import("@napi-rs/canvas");

    const scale = dpi / 72;
    const zip = new JSZip();
    const ext = format === "png" ? "png" : "jpg";

    for (const pageNum of pageNumbers) {
      if (pageNum < 1 || pageNum > totalPages) continue;

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const width = Math.round(viewport.width);
      const height = Math.round(viewport.height);

      // Create a real canvas
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d") as any;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Render PDF page into canvas
      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      // Export to buffer
      let imgBuffer: Buffer;
      if (format === "png") {
        imgBuffer = await canvas.encode("png");
      } else {
        imgBuffer = await canvas.encode("jpeg", 92);
      }

      zip.file(`page_${pageNum}.${ext}`, imgBuffer);
    }

    // Single page → return image directly (no ZIP)
    if (pageNumbers.length === 1) {
      const singlePage = pageNumbers[0];
      const fileObj = zip.files[`page_${singlePage}.${ext}`];
      if (fileObj) {
        const imgBuffer = await fileObj.async("nodebuffer");
        return new NextResponse(imgBuffer, {
          headers: {
            "Content-Type": format === "png" ? "image/png" : "image/jpeg",
            "Content-Disposition": `attachment; filename="page_${singlePage}.${ext}"`,
          },
        });
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="pdf_images.zip"',
      },
    });
  } catch (error) {
    console.error("[pdf-to-image]", error);
    return NextResponse.json({ error: "Gagal memproses file" }, { status: 500 });
  }
}
