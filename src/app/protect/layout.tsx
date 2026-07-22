import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Protect PDF",
  description: "Encrypt and protect PDF files with a password.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
