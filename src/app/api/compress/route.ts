import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "File PDF diperlukan" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer, { 
      ignoreEncryption: true 
    });

    // Simpan kembali PDF untuk optimasi dasar
    const compressedPdfBytes = await pdfDoc.save({ 
      useObjectStreams: true 
    });

    return new NextResponse(new Uint8Array(compressedPdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="compressed.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal memproses file" },
      { status: 500 }
    );
  }
}
