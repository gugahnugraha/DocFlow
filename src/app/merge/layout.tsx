import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF",
  description: "Combine multiple PDFs into one document quickly and securely.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
