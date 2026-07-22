"use client";

import Header from "@/components/Header";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Mail, MessageCircle, MapPin } from "lucide-react";

export default function ContactPage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header activePath="/contact" />
      
      <main className="flex-1 max-w-screen-xl w-full mx-auto px-5 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {t.pages.contact?.title || "Contact Us"}
          </h1>
          <p className="text-lg text-slate-500">
            {t.pages.contact?.description || "Get in touch with our team for support or inquiries."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Email */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-xl mb-2">{language === 'id' ? 'Kirim Email' : 'Email Us'}</h3>
            <p className="text-sm text-slate-500 mb-6">{language === 'id' ? 'Tim kami akan membalas dalam 24 jam.' : 'Our team will reply within 24 hours.'}</p>
            <a href="mailto:support@docflow.com" className="font-semibold text-orange-600 hover:text-orange-700">
              support@docflow.com
            </a>
          </div>

          {/* Chat */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center animate-fade-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-xl mb-2">Live Chat</h3>
            <p className="text-sm text-slate-500 mb-6">{language === 'id' ? 'Tersedia pada jam kerja (Senin-Jumat).' : 'Available during business hours (Mon-Fri).'}</p>
            <button className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors">
              {language === 'id' ? 'Mulai Chat' : 'Start Chat'}
            </button>
          </div>

          {/* Office */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center animate-fade-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-xl mb-2">{language === 'id' ? 'Kantor' : 'Office'}</h3>
            <p className="text-sm text-slate-500">
              Jakarta Selatan, Indonesia<br/>12930
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
