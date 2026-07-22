"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useEffect } from "react";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { language } = useLanguage();
  
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <Footer />
      <CookieBanner />
    </div>
  );
}
