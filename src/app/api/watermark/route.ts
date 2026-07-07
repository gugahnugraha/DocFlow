import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const text = formData.get("text") as string;
    const fontSize = parseInt(formData.get("fontSize") as string) || 48;
    const opacity = parseFloat(formData.get("opacity") as string) || 0.3;
    const rotation = parseInt(formData.get("rotation") as string) || 45;
    const color = formData.get("color") as string || "#FF0000";
    const position = formData.get("position") as string || "center";
    const pages = formData.get("pages") as string || "all"; // "all" or JSON array of 0-based indices

    if (!file || !text) {
      return NextResponse.json({ error: "File PDF dan teks watermark diperlukan" }, { status: 400 });
    }

    // Parse hex color to rgb
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const allPages = pdfDoc.getPages();

    const targetIndices: number[] =
      pages === "all"
        ? allPages.map((_, i) => i)
        : JSON.parse(pages);

    for (const idx of targetIndices) {
      if (idx < 0 || idx >= allPages.length) continue;
      const page = allPages[idx];
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      let x = 0;
      let y = 0;

      switch (position) {
        case "center":
          x = (width - textWidth) / 2;
          y = (height - textHeight) / 2;
          break;
        case "top-left":
          x = 40;
          y = height - textHeight - 40;
          break;
        case "top-center":
          x = (width - textWidth) / 2;
          y = height - textHeight - 40;
          break;
        case "top-right":
          x = width - textWidth - 40;
          y = height - textHeight - 40;
          break;
        case "bottom-left":
          x = 40;
          y = 40;
          break;
        case "bottom-center":
          x = (width - textWidth) / 2;
          y = 40;
          break;
        case "bottom-right":
          x = width - textWidth - 40;
          y = 40;
          break;
        case "diagonal":
          x = (width - textWidth) / 2;
          y = (height - textHeight) / 2;
          break;
        default:
          x = (width - textWidth) / 2;
          y = (height - textHeight) / 2;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
        rotate: degrees(position === "diagonal" ? rotation : 0),
      });
    }

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="watermarked.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memproses file" }, { status: 500 });
  }
}
