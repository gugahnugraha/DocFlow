import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Numbers",
  description: "Add page numbers into PDFs with ease. Choose position, dimensions, typography.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
