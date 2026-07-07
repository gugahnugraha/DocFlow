import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PageSizes } from "pdf-lib";
import sharp from "sharp";

export const runtime = "nodejs";

const PAGE_SIZE_MAP: Record<string, [number, number]> = {
  A4:     PageSizes.A4,
  A3:     PageSizes.A3,
  Letter: PageSizes.Letter,
  Legal:  PageSizes.Legal,
  fit:    [0, 0],
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const pageSize    = (formData.get("pageSize") as string)    || "A4";
    const orientation = (formData.get("orientation") as string) || "portrait";
    const margin      = parseInt(formData.get("margin") as string) || 20;
    const fitMode     = (formData.get("fitMode") as string) || "contain";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Setidaknya satu gambar diperlukan" }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const mimeType = file.type.toLowerCase();
      let buffer = Buffer.from(await file.arrayBuffer());

      // Normalise to JPEG or PNG using sharp so we can embed reliably
      let embeddedImage;
      try {
        if (mimeType === "image/png" || mimeType.includes("png")) {
          // Ensure it's a clean PNG (handles palette/greyscale etc.)
          const pngBuf = await sharp(buffer).png().toBuffer();
          embeddedImage = await pdfDoc.embedPng(pngBuf);
        } else {
          // Convert anything else (jpg, webp, gif, bmp …) to JPEG
          const jpgBuf = await sharp(buffer).jpeg({ quality: 95 }).toBuffer();
          embeddedImage = await pdfDoc.embedJpg(jpgBuf);
        }
      } catch (err) {
        console.warn(`Skipping file ${file.name}:`, err);
        continue;
      }

      const imgDims = embeddedImage.size();

      let pageWidth: number;
      let pageHeight: number;

      if (pageSize === "fit") {
        pageWidth  = imgDims.width;
        pageHeight = imgDims.height;
      } else {
        const sizes = PAGE_SIZE_MAP[pageSize] || PageSizes.A4;
        if (orientation === "landscape") {
          pageWidth  = sizes[1];
          pageHeight = sizes[0];
        } else {
          pageWidth  = sizes[0];
          pageHeight = sizes[1];
        }
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      const availW = pageWidth  - margin * 2;
      const availH = pageHeight - margin * 2;

      let drawW: number;
      let drawH: number;

      if (fitMode === "stretch") {
        drawW = availW;
        drawH = availH;
      } else if (fitMode === "original") {
        drawW = Math.min(imgDims.width,  availW);
        drawH = Math.min(imgDims.height, availH);
      } else {
        // contain — scale proportionally to fit, allow both up- and down-scaling
        const scaleX = availW / imgDims.width;
        const scaleY = availH / imgDims.height;
        const s = Math.min(scaleX, scaleY);
        drawW = imgDims.width  * s;
        drawH = imgDims.height * s;
      }

      // Centre on page
      const drawX = margin + (availW - drawW) / 2;
      const drawY = margin + (availH - drawH) / 2;

      page.drawImage(embeddedImage, { x: drawX, y: drawY, width: drawW, height: drawH });
    }

    if (pdfDoc.getPageCount() === 0) {
      return NextResponse.json(
        { error: "Tidak ada gambar yang valid. Format yang didukung: JPG, PNG, WebP." },
        { status: 400 }
      );
    }

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="images.pdf"',
      },
    });
  } catch (error) {
    console.error("[image-to-pdf]", error);
    return NextResponse.json({ error: "Gagal memproses file" }, { status: 500 });
  }
}
