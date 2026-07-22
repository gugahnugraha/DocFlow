import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF",
  description: "Reduce the file size of your PDF documents while maintaining quality.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
