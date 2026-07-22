import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF",
  description: "Extract pages from your PDF or split a document into multiple files.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
