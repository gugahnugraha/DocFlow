import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const rangesStr = formData.get("ranges") as string;
    const mergeAllStr = formData.get("mergeAll") as string;

    if (!file) {
      return NextResponse.json(
        { error: "File PDF diperlukan" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdf = await PDFDocument.load(buffer);
    const ranges = JSON.parse(rangesStr);
    const mergeAll = mergeAllStr === "true";

    if (mergeAll) {
      const mergedPdf = await PDFDocument.create();
      for (const range of ranges) {
        for (let pageNum = range.from; pageNum <= range.to; pageNum++) {
          const [copiedPage] = await mergedPdf.copyPages(pdf, [pageNum - 1]);
          mergedPdf.addPage(copiedPage);
        }
      }
      const pdfBytes = await mergedPdf.save();
      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="split.pdf"',
        },
      });
    } else {
      const zip = new JSZip();
      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        const newPdf = await PDFDocument.create();
        for (let pageNum = range.from; pageNum <= range.to; pageNum++) {
          const [copiedPage] = await newPdf.copyPages(pdf, [pageNum - 1]);
          newPdf.addPage(copiedPage);
        }
        const pdfBytes = await newPdf.save();
        zip.file(`split_part_${i + 1}.pdf`, pdfBytes);
      }
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      return new NextResponse(zipBuffer, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="split.zip"',
        },
      });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal memproses file" },
      { status: 500 }
    );
  }
}
