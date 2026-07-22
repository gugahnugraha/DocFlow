import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to common questions about using DocFlow.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
