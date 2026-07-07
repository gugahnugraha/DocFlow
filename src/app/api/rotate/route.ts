import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const rotationsStr = formData.get("rotations") as string; // JSON: { [pageIndex]: rotation }
    const globalRotation = formData.get("globalRotation") as string; // "0" | "90" | "180" | "270"

    if (!file) {
      return NextResponse.json({ error: "File PDF diperlukan" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();

    if (rotationsStr) {
      // Per-page rotations: { "0": 90, "2": 180, ... }
      const rotations: Record<string, number> = JSON.parse(rotationsStr);
      for (const [indexStr, rotation] of Object.entries(rotations)) {
        const index = parseInt(indexStr);
        if (index >= 0 && index < pages.length) {
          const page = pages[index];
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + rotation) % 360));
        }
      }
    } else if (globalRotation) {
      // Rotate all pages by the same amount
      const rotation = parseInt(globalRotation);
      for (const page of pages) {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotation) % 360));
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="rotated.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memproses file" }, { status: 500 });
  }
}
