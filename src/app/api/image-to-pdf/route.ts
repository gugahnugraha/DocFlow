import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PageSizes } from "pdf-lib";

const PAGE_SIZE_MAP: Record<string, [number, number]> = {
  A4:     PageSizes.A4,
  A3:     PageSizes.A3,
  Letter: PageSizes.Letter,
  Legal:  PageSizes.Legal,
  fit:    [0, 0], // special: fit page to image
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const pageSize = (formData.get("pageSize") as string) || "A4";
    const orientation = (formData.get("orientation") as string) || "portrait";
    const margin = parseInt(formData.get("margin") as string) || 20;
    const fitMode = (formData.get("fitMode") as string) || "contain"; // "contain" | "stretch" | "original"

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Setidaknya satu gambar diperlukan" }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const mimeType = file.type;
      const buffer = Buffer.from(await file.arrayBuffer());

      let image;
      if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
        image = await pdfDoc.embedJpg(buffer);
      } else if (mimeType === "image/png") {
        image = await pdfDoc.embedPng(buffer);
      } else {
        // Skip unsupported formats
        continue;
      }

      const imgDims = image.size();

      let pageWidth: number;
      let pageHeight: number;

      if (pageSize === "fit") {
        // Page fits the image exactly
        pageWidth = imgDims.width;
        pageHeight = imgDims.height;
      } else {
        const sizes = PAGE_SIZE_MAP[pageSize] || PageSizes.A4;
        if (orientation === "landscape") {
          pageWidth = sizes[1];
          pageHeight = sizes[0];
        } else {
          pageWidth = sizes[0];
          pageHeight = sizes[1];
        }
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const availW = pageWidth - margin * 2;
      const availH = pageHeight - margin * 2;

      let drawW: number;
      let drawH: number;
      let drawX: number;
      let drawY: number;

      if (fitMode === "stretch") {
        drawW = availW;
        drawH = availH;
      } else if (fitMode === "original") {
        drawW = imgDims.width;
        drawH = imgDims.height;
      } else {
        // contain: scale proportionally to fit within available space
        const scaleX = availW / imgDims.width;
        const scaleY = availH / imgDims.height;
        const scale = Math.min(scaleX, scaleY, 1);
        drawW = imgDims.width * scale;
        drawH = imgDims.height * scale;
      }

      // Center the image on the page
      drawX = margin + (availW - drawW) / 2;
      drawY = margin + (availH - drawH) / 2;

      page.drawImage(image, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH,
      });
    }

    if (pdfDoc.getPageCount() === 0) {
      return NextResponse.json({ error: "Tidak ada gambar yang valid (JPG/PNG saja)" }, { status: 400 });
    }

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="images.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memproses file" }, { status: 500 });
  }
}
