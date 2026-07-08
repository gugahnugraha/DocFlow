import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const splitMode = formData.get("extractMode") as string; // Can be "all", "select", or undefined (for range mode)
    const rangesStr = formData.get("ranges") as string;
    const pagesToExtractStr = formData.get("pagesToExtract") as string;
    const mergeAllStr = formData.get("mergeAll") as string;

    if (!file) {
      return NextResponse.json(
        { error: "File PDF diperlukan" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdf = await PDFDocument.load(buffer);
    const mergeAll = mergeAllStr === "true";

    let extractedRanges: Array<{ from: number; to: number }> | number[];

    if (splitMode === "all" || splitMode === "select") {
      // Pages mode
      if (splitMode === "all") {
        // Extract all pages as individual files or merged
        extractedRanges = Array.from({ length: pdf.getPageCount() }, (_, i) => i + 1);
      } else {
        // Select specific pages
        extractedRanges = JSON.parse(pagesToExtractStr);
      }
    } else {
      // Range mode (default)
      extractedRanges = JSON.parse(rangesStr);
    }

    if (mergeAll) {
      // Merge everything into one PDF
      const mergedPdf = await PDFDocument.create();
      
      if (splitMode === "all" || splitMode === "select") {
        // Pages mode - extract pages
        for (const pageNum of extractedRanges as number[]) {
          const [copiedPage] = await mergedPdf.copyPages(pdf, [pageNum - 1]);
          mergedPdf.addPage(copiedPage);
        }
      } else {
        // Range mode - extract ranges
        for (const range of extractedRanges as Array<{ from: number; to: number }>) {
          for (let pageNum = range.from; pageNum <= range.to; pageNum++) {
            const [copiedPage] = await mergedPdf.copyPages(pdf, [pageNum - 1]);
            mergedPdf.addPage(copiedPage);
          }
        }
      }
      
      const pdfBytes = await mergedPdf.save();
      return new NextResponse(new Uint8Array(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="split.pdf"',
        },
      });
    } else {
      // Create separate files
      const zip = new JSZip();
      
      if (splitMode === "all" || splitMode === "select") {
        // Pages mode - one file per page
        for (let i = 0; i < extractedRanges.length; i++) {
          const pageNum = (extractedRanges as number[])[i];
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdf, [pageNum - 1]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();
          zip.file(`split_page_${pageNum}.pdf`, pdfBytes);
        }
      } else {
        // Range mode - one file per range
        for (let i = 0; i < extractedRanges.length; i++) {
          const range = (extractedRanges as Array<{ from: number; to: number }>)[i];
          const newPdf = await PDFDocument.create();
          for (let pageNum = range.from; pageNum <= range.to; pageNum++) {
            const [copiedPage] = await newPdf.copyPages(pdf, [pageNum - 1]);
            newPdf.addPage(copiedPage);
          }
          const pdfBytes = await newPdf.save();
          zip.file(`split_part_${i + 1}.pdf`, pdfBytes);
        }
      }
      
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      return new NextResponse(new Uint8Array(zipBuffer), {
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
