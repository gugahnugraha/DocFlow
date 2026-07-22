"use client";

import Header from "@/components/Header";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Heart, CreditCard, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function DonatePage() {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("gugahnugraha8@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header activePath="/donate" />
      
      <main className="flex-1 max-w-screen-xl w-full mx-auto px-5 py-4 md:py-6">
        <div className="text-center max-w-2xl mx-auto mb-6 animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            {t.pages.donate?.title || "Support DocFlow"}
          </h1>
          <p className="text-base text-slate-500">
            {t.pages.donate?.description || "Help us keep these tools free forever."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* PayPal */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-fade-up flex flex-col items-center text-center" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#00457C]" fill="currentColor">
                <path d="M84.5,29.9c-1.4-6.3-6.5-9.6-13.9-9.6H42.7c-1.6,0-2.9,1.1-3.2,2.7L26,81c-0.2,1.3,0.8,2.4,2.1,2.4h15l5.1-32.4 c0.3-1.6,1.6-2.7,3.2-2.7h8.8c11,0,19.3-4.4,21.5-13.3C82,34.4,84.1,31.7,84.5,29.9z" />
                <path d="M37.8,20.3c1.4-6.3,6.5-9.6,13.9-9.6h27.9c-1.4-6.3-6.5-9.6-13.9-9.6H37.8c-1.6,0-2.9,1.1-3.2,2.7L18.4,81 c-0.2,1.3,0.8,2.4,2.1,2.4h15L37.8,20.3z" opacity="0.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">PayPal</h2>
            <p className="text-slate-500 mb-8 text-sm flex-1">{language === 'id' ? 'Kirim donasi via PayPal langsung ke email.' : 'Send a donation via PayPal directly to email.'}</p>
            
            <a 
              href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=gugahnugraha8@gmail.com&item_name=Support+DocFlow&currency_code=USD" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#00457C] hover:bg-[#003665] text-white font-bold transition-all shadow-md shadow-[#00457C]/20 hover:-translate-y-1"
            >
              {language === 'id' ? 'Donasi via PayPal' : 'Donate via PayPal'}
            </a>
          </div>

          {/* Buy Me A Coffee */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-fade-up flex flex-col items-center text-center" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <span className="text-4xl">☕</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Buy Me a Coffee</h2>
            <p className="text-slate-500 mb-8 text-sm flex-1">{language === 'id' ? 'Dukung melalui platform Buy Me a Coffee.' : 'Support us through Buy Me a Coffee.'}</p>
            <a 
              href="https://www.buymeacoffee.com/gugah" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full hover:-translate-y-1 transition-transform"
            >
              <img 
                src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=gugah&button_colour=fb7318&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" 
                alt="Buy me a coffee" 
                className="w-full h-14 object-contain"
              />
            </a>
          </div>

          {/* Trakteer */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-fade-up flex flex-col items-center text-center" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600 fill-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Trakteer</h2>
            <p className="text-slate-500 mb-8 text-sm flex-1">{language === 'id' ? 'Berikan dukungan melalui Trakteer (Lokal).' : 'Support locally via Trakteer platform.'}</p>
            <a 
              href="https://trakteer.id/gugah_nugraha" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-md shadow-red-600/20 hover:-translate-y-1"
            >
              <img src="https://trakteer.id/images/mix/logomark-light.png" alt="Trakteer" className="w-5 h-5 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
              Trakteer Kami
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
