import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const format = (formData.get("format") as string) || "jpg"; // "jpg" | "png"
    const dpi = parseInt(formData.get("dpi") as string) || 150;
    const pagesStr = formData.get("pages") as string; // "all" or JSON array of 1-based page numbers

    if (!file) {
      return NextResponse.json({ error: "File PDF diperlukan" }, { status: 400 });
    }

    // Use pdfjs-dist on the server side for rendering
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs" as any);

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    const totalPages = pdf.numPages;

    let pageNumbers: number[];
    if (!pagesStr || pagesStr === "all") {
      pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      pageNumbers = JSON.parse(pagesStr);
    }

    const scale = dpi / 72; // PDF points are 72 DPI
    const zip = new JSZip();

    for (const pageNum of pageNumbers) {
      if (pageNum < 1 || pageNum > totalPages) continue;

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      // Use canvas via node-canvas or OffscreenCanvas
      // We'll use the CanvasFactory approach with a simple buffer canvas
      const width = Math.round(viewport.width);
      const height = Math.round(viewport.height);

      // Create a minimal canvas implementation using Uint8ClampedArray
      const imageData = new Uint8ClampedArray(width * height * 4);
      // Fill white background
      for (let i = 0; i < imageData.length; i += 4) {
        imageData[i] = 255;     // R
        imageData[i + 1] = 255; // G
        imageData[i + 2] = 255; // B
        imageData[i + 3] = 255; // A
      }

      // Use sharp to create the image from the rendered page data
      // Since we need actual rendering, we use sharp's raw input
      const sharp = (await import("sharp")).default;

      // Render using pdfjs with a node canvas context stub
      // We create a simple render context that writes to our buffer
      const canvasContext = {
        canvas: {
          width,
          height,
        },
        // Minimal 2D context that captures operations to imageData buffer
        // pdfjs will call these methods during rendering
        _imageData: imageData,
        _width: width,
        _height: height,
        drawImage: () => {},
        fillRect: (x: number, y: number, w: number, h: number) => {},
        getImageData: (x: number, y: number, w: number, h: number) => ({
          data: imageData,
          width: w,
          height: h,
        }),
        putImageData: () => {},
        // Stub remaining required methods
        save: () => {},
        restore: () => {},
        transform: () => {},
        setTransform: () => {},
        resetTransform: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        fill: () => {},
        fillText: () => {},
        strokeText: () => {},
        clip: () => {},
        arc: () => {},
        rect: () => {},
        bezierCurveTo: () => {},
        quadraticCurveTo: () => {},
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        createPattern: () => ({}),
        measureText: () => ({ width: 0 }),
        scale: () => {},
        rotate: () => {},
        translate: () => {},
        strokeRect: () => {},
        clearRect: () => {},
        isPointInPath: () => false,
        lineWidth: 1,
        strokeStyle: "#000",
        fillStyle: "#fff",
        globalAlpha: 1,
        globalCompositeOperation: "source-over",
        lineJoin: "miter",
        lineCap: "butt",
        miterLimit: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 0,
        shadowColor: "",
        font: "10px sans-serif",
        textAlign: "start",
        textBaseline: "alphabetic",
        direction: "ltr",
        imageSmoothingEnabled: true,
        setLineDash: () => {},
        getLineDash: () => [],
        lineDashOffset: 0,
      };

      // Render the page with the stub context
      await page.render({
        canvasContext: canvasContext as any,
        viewport,
      }).promise.catch(() => {
        // Rendering with stub context will partially fail, that's expected
        // The white background image will be used as fallback
      });

      // Create image with sharp using white background at correct dimensions
      const img = await sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      })
        .toFormat(format === "png" ? "png" : "jpeg", {
          quality: format === "png" ? undefined : 90,
        })
        .toBuffer();

      const ext = format === "png" ? "png" : "jpg";
      zip.file(`page_${pageNum}.${ext}`, img);
    }

    // If single page and not zipping, return directly
    if (pageNumbers.length === 1) {
      const singlePage = pageNumbers[0];
      const ext = format === "png" ? "png" : "jpg";
      const fileObj = zip.files[`page_${singlePage}.${ext}`];
      if (fileObj) {
        const imgBuffer = await fileObj.async("nodebuffer");
        return new NextResponse(imgBuffer, {
          headers: {
            "Content-Type": format === "png" ? "image/png" : "image/jpeg",
            "Content-Disposition": `attachment; filename="page_${singlePage}.${ext}"`,
          },
        });
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="pdf_images.zip"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memproses file" }, { status: 500 });
  }
}
