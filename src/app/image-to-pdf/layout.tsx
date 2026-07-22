import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to PDF",
  description: "Convert JPG, PNG, and other images to a PDF document.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
