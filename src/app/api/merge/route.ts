import { NextRequest, NextResponse } from "next/server";
import { mergePDFs } from "@/lib/pdf";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length < 2) {
      return NextResponse.json(
        { error: "Setidaknya 2 file PDF diperlukan" },
        { status: 400 }
      );
    }

    const buffers = await Promise.all(
      files.map(async (file) => Buffer.from(await file.arrayBuffer()))
    );

    const mergedPdf = await mergePDFs(buffers);

    return new NextResponse(mergedPdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
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
