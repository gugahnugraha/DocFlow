import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit PDF",
  description: "Add text, highlights, and annotations to your PDF documents.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
