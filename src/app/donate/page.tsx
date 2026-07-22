"use client";

import Header from "@/components/Header";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Heart, Coffee, CreditCard } from "lucide-react";
import Link from "next/link";

export default function DonatePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header activePath="/donate" />
      
      <main className="flex-1 max-w-screen-xl w-full mx-auto px-5 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {t.pages.donate?.title || "Support DocFlow"}
          </h1>
          <p className="text-lg text-slate-500">
            {t.pages.donate?.description || "Help us keep these tools free forever."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Buy a Coffee */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Buy us a coffee</h2>
            </div>
            <p className="text-slate-500 mb-8">A small contribution goes a long way in paying for server costs and keeping DocFlow free of ads.</p>
            <Link href="#" className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold transition-colors">
              <Coffee className="w-5 h-5" />
              Donate $5
            </Link>
          </div>

          {/* Become a Sponsor */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-fade-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Become a Sponsor</h2>
            </div>
            <p className="text-slate-500 mb-8">Support continuous development and get a backlink to your project on our GitHub repository.</p>
            <Link href="#" className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-md shadow-emerald-600/20">
              <Heart className="w-5 h-5" />
              {t.pages.donate?.button || "Donate Now"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
