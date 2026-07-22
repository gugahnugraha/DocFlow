"use client";

import Header from "@/components/Header";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header activePath="/privacy" />
      
      <main className="flex-1 max-w-screen-xl w-full mx-auto px-5 py-12">
        <div className="max-w-3xl mx-auto animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <div className="mb-12">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              {t.pages.privacy?.title || "Privacy Policy"}
            </h1>
            <p className="text-lg text-slate-500">
              {t.pages.privacy?.description || "How we handle your data and protect your privacy."}
            </p>
          </div>

          <div className="prose prose-slate max-w-none bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
            {language === 'id' ? (
              <>
                <h2>1. Kami tidak menyimpan file Anda</h2>
                <p>Semua pemrosesan file dilakukan dengan aman. Setelah Anda mengunduh dokumen yang telah diproses, file asli dan file hasil pemrosesan akan segera dihapus secara permanen dari server kami dalam waktu kurang dari 1 jam.</p>
                <h2>2. Keamanan Data</h2>
                <p>Koneksi antara perangkat Anda dan server kami dienkripsi menggunakan SSL/TLS 256-bit standar industri. Tidak ada pihak ketiga yang dapat mengintersep dokumen Anda.</p>
                <h2>3. Pengumpulan Data Analitik</h2>
                <p>Kami menggunakan alat analitik dasar untuk memantau performa website dan error log. Alat ini tidak mengumpulkan data personal yang bisa mengidentifikasi Anda secara spesifik.</p>
              </>
            ) : (
              <>
                <h2>1. We do not store your files</h2>
                <p>All file processing is done securely. Once you download your processed documents, both the original and processed files are permanently deleted from our servers within 1 hour.</p>
                <h2>2. Data Security</h2>
                <p>The connection between your device and our servers is encrypted using industry-standard 256-bit SSL/TLS. No third party can intercept your documents.</p>
                <h2>3. Analytics Data Collection</h2>
                <p>We use basic analytics tools to monitor website performance and error logs. These tools do not collect personally identifiable information.</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
