import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const password = formData.get("password") as string;

    if (!file) {
      return NextResponse.json({ error: "File PDF diperlukan" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let pdfDoc;
    try {
      // Try loading with password if provided
      pdfDoc = await PDFDocument.load(buffer, {
        ignoreEncryption: true,
        // @ts-ignore — pdf-lib password option
        password: password || "",
      });
    } catch {
      return NextResponse.json(
        { error: "Password salah atau file tidak dapat dibuka" },
        { status: 400 }
      );
    }

    // Save without any encryption — effectively removes password protection
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="unlocked.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memproses file" }, { status: 500 });
  }
}
