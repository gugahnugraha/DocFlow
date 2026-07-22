import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reorder PDF",
  description: "Sort, organize, and reorder PDF pages in any way you prefer.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
