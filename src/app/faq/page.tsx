"use client";

import Header from "@/components/Header";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { HelpCircle } from "lucide-react";

export default function FaqPage() {
  const { t, language } = useLanguage();

  const faqsEn = [
    { q: "Are my files secure?", a: "Yes. All processing is done securely. Files are automatically deleted from our servers immediately after processing is complete." },
    { q: "Is DocFlow totally free?", a: "Yes! DocFlow is entirely free to use without limits or annoying watermarks." },
    { q: "Do I need to install any software?", a: "No! DocFlow is entirely web-based. You can process your PDFs from any modern browser." },
    { q: "Can I use DocFlow on my phone?", a: "Absolutely. Our website is fully responsive and works great on iOS and Android devices." },
  ];

  const faqsId = [
    { q: "Apakah file saya aman?", a: "Ya. Semua pemrosesan dilakukan secara aman. File akan otomatis dihapus dari server kami segera setelah selesai diproses." },
    { q: "Apakah DocFlow sepenuhnya gratis?", a: "Ya! DocFlow sepenuhnya gratis digunakan tanpa batasan atau watermark yang mengganggu." },
    { q: "Apakah saya harus menginstal aplikasi?", a: "Tidak! DocFlow berbasis web sepenuhnya. Anda dapat memproses PDF dari browser modern apa pun." },
    { q: "Bisakah saya menggunakan DocFlow di HP?", a: "Tentu saja. Website kami sepenuhnya responsif dan berjalan lancar di perangkat iOS maupun Android." },
  ];

  const faqs = language === 'id' ? faqsId : faqsEn;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header activePath="/faq" />
      
      <main className="flex-1 max-w-screen-xl w-full mx-auto px-5 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {t.pages.faq?.title || "Frequently Asked Questions"}
          </h1>
          <p className="text-lg text-slate-500">
            {t.pages.faq?.description || "Find answers to common questions about DocFlow."}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4 animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{faq.q}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
