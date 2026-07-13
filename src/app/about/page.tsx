"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import Header from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, Github, Instagram, Code2, ShieldCheck, Zap, Heart } from "lucide-react";

export default function About() {
  const { t } = useLanguage();

  // Safely check if pages.about translations exist, otherwise fallback
  const translations = t.pages.about || {
    title: "Tentang Kami",
    subtitle: "Misi kami adalah mempermudah pengelolaan dokumen PDF Anda",
    description: "DocFlow adalah aplikasi SaaS PDF modern, cepat, dan aman, yang dirancang untuk membantu Anda memanipulasi dokumen PDF langsung di browser Anda dengan performa tinggi dan privasi penuh.",
    authorTitle: "Pengembang Utama",
    authorName: "Gugah Nugraha",
    authorDesc: "Gugah Nugraha adalah seorang Software Engineer yang berfokus pada pembangunan aplikasi web berkinerja tinggi, modern, dan ramah pengguna. Dengan hasrat besar dalam pengembangan open source, ia merancang DocFlow untuk menjadi solusi SaaS pengelolaan PDF terbaik yang mengedepankan privasi dan kemudahan akses bagi semua orang.",
    connectTitle: "Hubungi Saya",
    githubLabel: "GitHub",
    instagramLabel: "Instagram",
    featuresTitle: "Kenapa Memilih Kami?",
    features: {
      speed: {
        title: "Performa Cepat",
        desc: "Didukung oleh teknologi modern untuk pemrosesan dokumen secepat kilat langsung di browser Anda."
      },
      privacy: {
        title: "Privasi Utama",
        desc: "Kami menghargai data Anda. Sebagian besar proses manipulasi dilakukan secara lokal untuk privasi maksimal."
      },
      ux: {
        title: "UI/UX Premium",
        desc: "Tampilan antarmuka yang bersih, intuitif, dan responsif untuk kenyamanan kerja Anda."
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <Header activePath="/about" />

      <main className="flex-1 max-w-screen-xl w-full mx-auto px-5 py-12">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Column: Product Info & Why Us */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 py-1 px-3 text-xs font-bold bg-orange-100 text-orange-600 rounded-full">
                <Code2 className="w-3.5 h-3.5" />
                DocFlow SaaS
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text)] leading-tight sm:text-5xl">
                {translations.title}
              </h1>
              <p className="text-xl font-medium text-orange-600 leading-normal">
                {translations.subtitle}
              </p>
              <p className="text-base text-[var(--text-muted)] leading-relaxed max-w-2xl">
                {translations.description}
              </p>
            </div>

            <div className="border-t border-[var(--border)] pt-8">
              <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
                {translations.featuresTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                {/* Feature 1 */}
                <div className="card p-5 space-y-3 hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-[var(--text)]">
                    {translations.features.speed.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {translations.features.speed.desc}
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="card p-5 space-y-3 hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-[var(--text)]">
                    {translations.features.privacy.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {translations.features.privacy.desc}
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="card p-5 space-y-3 hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-[var(--text)]">
                    {translations.features.ux.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {translations.features.ux.desc}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Developer Profile Card */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="card p-8 relative overflow-hidden border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500">

              {/* Background gradient accents */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center space-y-6">

                {/* Creator Avatar container */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-orange-500 via-orange-600 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-white text-3xl font-extrabold">GN</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white text-orange-500 rounded-full p-1.5 shadow-md border border-orange-100 animate-bounce">
                    <Code2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Developer details */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                    {translations.authorTitle}
                  </p>
                  <h3 className="text-2xl font-extrabold text-[var(--text)]">
                    {translations.authorName}
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto" />
                </div>

                {/* Bio */}
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {translations.authorDesc}
                </p>

                {/* Social Buttons */}
                <div className="w-full space-y-3 pt-4 border-t border-[var(--border)]">
                  <p className="text-xs font-bold text-[var(--text-subtle)] uppercase tracking-wider">
                    {translations.connectTitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">

                    {/* GitHub button */}
                    <a
                      href="https://github.com/gugahnugraha"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-[var(--border)] bg-white text-sm font-bold text-[var(--text)] hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                    >
                      <Github className="w-4 h-4" />
                      {translations.githubLabel}
                    </a>

                    {/* Instagram button */}
                    <a
                      href="https://instagram.com/gugahnugraha"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-[var(--border)] bg-white text-sm font-bold text-[var(--text)] hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                    >
                      <Instagram className="w-4 h-4" />
                      {translations.instagramLabel}
                    </a>

                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Mini Footer */}
      <footer className="bg-white/80 border-t border-[var(--border)] py-6 px-5 mt-auto">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-subtle)]">
          <p>© {new Date().getFullYear()} DocFlow. {t.pages.home.copyright}</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-orange-500 transition-colors">Beranda</Link>
            <a href="#" className="hover:text-orange-500 transition-colors">{t.pages.home.footer.privacy}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
