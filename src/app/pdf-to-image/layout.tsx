import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Image",
  description: "Convert each PDF page into a JPG or PNG image.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
