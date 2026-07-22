import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate PDF",
  description: "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
