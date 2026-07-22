import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unlock PDF",
  description: "Remove PDF password security, giving you the freedom to use your PDFs as you want.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
