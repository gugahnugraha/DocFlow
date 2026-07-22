import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how DocFlow handles your data and protects your privacy securely.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
