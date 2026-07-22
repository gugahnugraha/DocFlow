import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the DocFlow team for support or inquiries.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
