import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watermark PDF",
  description: "Stamp an image or text watermark over your PDF in seconds.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
