import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import ClientLayout from "./ClientLayout";

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
    <LanguageProvider>
      <html lang="id">
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