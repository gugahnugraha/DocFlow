"use client";

import Header from "@/components/Header";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Shield, FileCheck, Lock, BarChart3, Cookie, Scale, UserX } from "lucide-react";

export default function PrivacyPage() {
  const { t, language } = useLanguage();

  const policiesEn = [
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "1. File Handling & Deletion",
      content: "All file processing is done securely. Once you download your processed documents, both the original and processed files are permanently deleted from our servers within 1 hour."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "2. Data Encryption",
      content: "The connection between your device and our servers is encrypted using industry-standard 256-bit SSL/TLS. No third party can intercept your documents during transit."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "3. Analytics & Tracking",
      content: "We use basic analytics tools to monitor website performance and error logs. These tools do not collect personally identifiable information (PII) or read your document contents."
    },
    {
      icon: <Cookie className="w-6 h-6" />,
      title: "4. Cookies Policy",
      content: "We use essential cookies to keep you logged in and remember your language preferences. We do not use third-party advertising cookies."
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "5. Third-Party Services",
      content: "We never sell or share your personal data with third parties. Your files are exclusively processed by DocFlow's automated systems."
    },
    {
      icon: <UserX className="w-6 h-6" />,
      title: "6. User Rights & Account Deletion",
      content: "If you create an account, you have the right to request a complete deletion of your account and associated email address at any time from the account settings."
    }
  ];

  const policiesId = [
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "1. Penanganan & Penghapusan File",
      content: "Semua pemrosesan file dilakukan dengan aman. File asli dan file hasil pemrosesan akan dihapus secara permanen dari server kami dalam waktu kurang dari 1 jam."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "2. Enkripsi Data",
      content: "Koneksi antara perangkat Anda dan server kami dienkripsi menggunakan standar industri SSL/TLS 256-bit. Pihak ketiga tidak dapat menyadap dokumen Anda saat diunggah."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "3. Analitik & Pelacakan",
      content: "Kami menggunakan alat analitik dasar untuk memantau performa website. Alat ini tidak mengumpulkan data pribadi (PII) dan sama sekali tidak dapat membaca isi dokumen Anda."
    },
    {
      icon: <Cookie className="w-6 h-6" />,
      title: "4. Kebijakan Cookie",
      content: "Kami menggunakan cookie esensial hanya untuk menjaga sesi login Anda dan menyimpan preferensi bahasa. Kami tidak menggunakan cookie pelacak iklan pihak ketiga."
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "5. Layanan Pihak Ketiga",
      content: "Kami tidak pernah menjual atau membagikan data Anda. File Anda secara eksklusif hanya diproses oleh sistem otomatis internal DocFlow tanpa campur tangan manusia."
    },
    {
      icon: <UserX className="w-6 h-6" />,
      title: "6. Hak Pengguna & Hapus Akun",
      content: "Jika Anda membuat akun, Anda memiliki hak penuh untuk meminta penghapusan akun beserta alamat email yang terdaftar kapan saja melalui halaman pengaturan akun."
    }
  ];

  const policies = language === 'id' ? policiesId : policiesEn;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header activePath="/privacy" />
      
      <main className="flex-1 max-w-screen-xl w-full mx-auto px-5 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {t.pages.privacy?.title || "Privacy Policy"}
          </h1>
          <p className="text-lg text-slate-500">
            {t.pages.privacy?.description || "How we handle your data and protect your privacy."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          {policies.map((policy, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                {policy.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{policy.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{policy.content}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="max-w-5xl mx-auto mt-12 text-center animate-fade-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
           <p className="text-sm font-semibold text-slate-400">
             {language === 'id' ? 'Terakhir diperbarui: 22 Juli 2026' : 'Last updated: July 22, 2026'}
           </p>
        </div>
      </main>
    </div>
  );
}
