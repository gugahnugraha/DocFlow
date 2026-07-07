import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { mergePDFs, splitPDF, rotatePDF } from "./pdf";

const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

export const pdfQueue = new Queue("pdf", { connection });

export const pdfWorker = new Worker(
  "pdf",
  async (job) => {
    const { type, data } = job.data;

    switch (type) {
      case "merge":
        return await mergePDFs(data.buffers);
      case "split":
        return await splitPDF(data.buffer, data.splitAt);
      case "rotate":
        return await rotatePDF(data.buffer, data.rotation);
      default:
        throw new Error("Unknown job type");
    }
  },
  { connection }
);
