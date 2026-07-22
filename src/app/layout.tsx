import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  metadataBase: new URL("https://docflow.vercel.app"),
  title: {
    default: "DocFlow - Secure & Powerful PDF Tools",
    template: "%s | DocFlow",
  },
  description: "Merge, split, compress, edit, and protect your PDF documents right in your browser. No server uploads for maximum privacy. Free forever.",
  keywords: ["PDF", "Merge PDF", "Split PDF", "Compress PDF", "Edit PDF", "Free PDF Tools", "DocFlow", "Secure PDF"],
  authors: [{ name: "DocFlow Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://docflow.vercel.app",
    siteName: "DocFlow",
    title: "DocFlow - Secure & Powerful PDF Tools",
    description: "Merge, split, compress, edit, and protect your PDF documents right in your browser. 100% Private and Free.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "DocFlow PDF Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DocFlow - Secure & Powerful PDF Tools",
    description: "Process your PDFs locally in your browser. Fast, secure, and free.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <html lang="en">
        <body className="antialiased">
          <AuthSessionProvider>
            <ToastProvider>
              <ClientLayout>{children}</ClientLayout>
            </ToastProvider>
          </AuthSessionProvider>
        </body>
      </html>
    </LanguageProvider>
  );
}