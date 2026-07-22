"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Periksa apakah pengguna sudah pernah merespon
    const consent = localStorage.getItem("docflow-cookie-consent");
    if (!consent) {
      // Munculkan setelah 1.5 detik agar tidak mengganggu saat pertama load
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("docflow-cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("docflow-cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-[100] animate-fade-up flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 text-slate-200">
      
      <div className="flex items-start md:items-center gap-4 w-full md:w-auto flex-1 max-w-screen-xl mx-auto md:mx-0">
        <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center shrink-0 hidden sm:flex">
          <Cookie className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white mb-1">
            {language === 'id' ? 'Kami Menggunakan Cookies 🍪' : 'We Use Cookies 🍪'}
          </h4>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-4xl">
            {language === 'id' 
              ? 'Kami menggunakan cookie esensial untuk fungsi situs dan analitik dasar demi meningkatkan pengalaman Anda.' 
              : 'We use essential cookies for site functionality and basic analytics to improve your experience.'}
            {" "}
            <Link href="/privacy" className="text-orange-400 hover:underline font-medium whitespace-nowrap">
              {language === 'id' ? 'Pelajari lebih lanjut.' : 'Learn more.'}
            </Link>
          </p>
        </div>
      </div>
      
      <div className="flex gap-3 w-full md:w-auto shrink-0 max-w-screen-xl mx-auto md:mx-0">
        <button 
          className="flex-1 md:flex-none py-2.5 px-6 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors" 
          onClick={handleDecline}
        >
          {language === 'id' ? 'Tolak' : 'Decline'}
        </button>
        <button 
          className="flex-1 md:flex-none py-2.5 px-6 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5" 
          onClick={handleAccept}
        >
          {language === 'id' ? 'Terima Semua' : 'Accept All'}
        </button>
      </div>
    </div>
  );
}
