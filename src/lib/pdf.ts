import { PDFDocument } from "pdf-lib";

export async function mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return Buffer.from(pdfBytes);
}

export async function splitPDF(pdfBuffer: Buffer, splitAt: number[]): Promise<Buffer[]> {
  const pdf = await PDFDocument.load(pdfBuffer);
  const totalPages = pdf.getPageCount();
  const pdfs: Buffer[] = [];

  let start = 0;
  for (const pageNum of splitAt) {
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, Array.from({ length: pageNum - start }, (_, i) => start + i));
    pages.forEach((page) => newPdf.addPage(page));
    pdfs.push(Buffer.from(await newPdf.save()));
    start = pageNum;
  }

  if (start < totalPages) {
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, Array.from({ length: totalPages - start }, (_, i) => start + i));
    pages.forEach((page) => newPdf.addPage(page));
    pdfs.push(Buffer.from(await newPdf.save()));
  }

  return pdfs;
}

export async function rotatePDF(pdfBuffer: Buffer, rotation: 0 | 90 | 180 | 270): Promise<Buffer> {
  const pdf = await PDFDocument.load(pdfBuffer);
  const pages = pdf.getPages();

  for (const page of pages) {
    page.setRotation(rotation as any);
  }

  return Buffer.from(await pdf.save());
}
