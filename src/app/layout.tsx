import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import AuthSessionProvider from "@/components/AuthSessionProvider";

export const metadata: Metadata = {
  title: "DocFlow - Alat PDF Online Gratis",
  description: "Merge, split, compress, dan konversi PDF dengan mudah dan cepat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <AuthSessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}