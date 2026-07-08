import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const position = (formData.get("position") as string) || "bottom-center";
    const format = (formData.get("format") as string) || "{n}"; // {n} = page, {total} = total pages
    const fontSize = parseInt(formData.get("fontSize") as string) || 12;
    const color = (formData.get("color") as string) || "#000000";
    const startNumber = parseInt(formData.get("startNumber") as string) || 1;
    const marginX = parseInt(formData.get("marginX") as string) || 40;
    const marginY = parseInt(formData.get("marginY") as string) || 24;
    const skipFirstPage = formData.get("skipFirstPage") === "true";

    if (!file) {
      return NextResponse.json({ error: "File PDF diperlukan" }, { status: 400 });
    }

    // Parse hex color
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    pages.forEach((page, index) => {
      if (skipFirstPage && index === 0) return;

      const pageNumber = index + startNumber;
      const text = format
        .replace("{n}", String(pageNumber))
        .replace("{total}", String(totalPages));

      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      let x = 0;
      let y = 0;

      switch (position) {
        case "top-left":
          x = marginX;
          y = height - textHeight - marginY;
          break;
        case "top-center":
          x = (width - textWidth) / 2;
          y = height - textHeight - marginY;
          break;
        case "top-right":
          x = width - textWidth - marginX;
          y = height - textHeight - marginY;
          break;
        case "bottom-left":
          x = marginX;
          y = marginY;
          break;
        case "bottom-center":
          x = (width - textWidth) / 2;
          y = marginY;
          break;
        case "bottom-right":
          x = width - textWidth - marginX;
          y = marginY;
          break;
        default:
          x = (width - textWidth) / 2;
          y = marginY;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(r, g, b),
      });
    });

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="numbered.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memproses file" }, { status: 500 });
  }
}
