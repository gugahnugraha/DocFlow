import { NextRequest, NextResponse } from "next/server";
import { splitPDF } from "@/lib/pdf";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const splitAtStr = formData.get("splitAt") as string;

    if (!file) {
      return NextResponse.json(
        { error: "File PDF diperlukan" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const splitAt = splitAtStr
      ? splitAtStr.split(",").map((s) => parseInt(s.trim()))
      : [];

    const pdfs = await splitPDF(buffer, splitAt);

    const zip = new JSZip();
    pdfs.forEach((pdf, index) => {
      zip.file(`split_${index + 1}.pdf`, pdf);
    });

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="split.zip"',
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
