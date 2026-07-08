import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    // order is a JSON array of 0-based original page indices in the desired output order
    // e.g. [2, 0, 1] means: output page 1 = original page 3, etc.
    const orderStr = formData.get("order") as string;

    if (!file) {
      return NextResponse.json({ error: "File PDF diperlukan" }, { status: 400 });
    }
    if (!orderStr) {
      return NextResponse.json({ error: "Urutan halaman diperlukan" }, { status: 400 });
    }

    const order: number[] = JSON.parse(orderStr);

    const buffer = Buffer.from(await file.arrayBuffer());
    const srcDoc = await PDFDocument.load(buffer);
    const totalPages = srcDoc.getPageCount();

    // Validate indices
    for (const idx of order) {
      if (idx < 0 || idx >= totalPages) {
        return NextResponse.json({ error: `Indeks halaman tidak valid: ${idx}` }, { status: 400 });
      }
    }

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, order);
    copiedPages.forEach((page) => newDoc.addPage(page));

    const pdfBytes = await newDoc.save();
    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="reordered.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memproses file" }, { status: 500 });
  }
}
