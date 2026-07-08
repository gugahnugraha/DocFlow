"use client";

import {
  FileType, Scissors, FileText, Pencil, ImageIcon,
  Lock, LockOpen, RotateCw, ArrowDownUp, Hash,
  Stamp, Upload, Zap, Shield, Globe, ArrowRight,
  Layers, Star,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const TOOL_UI = [
  { href: "/merge",        tKey: "merge",       icon: FileType,    accent: "#8b5cf6", lightBg: "#f5f3ff", category: "organize" },
  { href: "/split",        tKey: "split",       icon: Scissors,    accent: "#10b981", lightBg: "#ecfdf5", category: "organize" },
  { href: "/reorder",      tKey: "reorder",     icon: ArrowDownUp, accent: "#3b82f6", lightBg: "#dbeafe", category: "organize" },
  { href: "/rotate",       tKey: "rotate",      icon: RotateCw,    accent: "#06b6d4", lightBg: "#cffafe", category: "organize" },
  { href: "/edit",         tKey: "edit",        icon: Pencil,      accent: "#f97316", lightBg: "#ffedd5", category: "edit" },
  { href: "/watermark",    tKey: "watermark",   icon: Stamp,       accent: "#8b5cf6", lightBg: "#f5f3ff", category: "edit" },
  { href: "/page-numbers", tKey: "pageNumbers", icon: Hash,        accent: "#14b8a6", lightBg: "#ccfbf1", category: "edit" },
  { href: "/compress",     tKey: "compress",    icon: FileText,    accent: "#f59e0b", lightBg: "#fef3c7", category: "edit" },
  { href: "/pdf-to-image", tKey: "pdfToImage",  icon: ImageIcon,   accent: "#ec4899", lightBg: "#fce7f3", category: "convert" },
  { href: "/image-to-pdf", tKey: "imageToPdf",  icon: Upload,      accent: "#f97316", lightBg: "#ffedd5", category: "convert" },
  { href: "/protect",      tKey: "protect",     icon: Lock,        accent: "#ef4444", lightBg: "#fee2e2", category: "security" },
  { href: "/unlock",       tKey: "unlock",      icon: LockOpen,    accent: "#22c55e", lightBg: "#dcfce7", category: "security" },
] as const;

/* ─── Component ────────────────────────────────────────────────────────────── */
export default function Home() {
  const { t } = useLanguage();

  const CATEGORIES = [
    { key: "organize", label: t.pages.home.categories.organize },
    { key: "edit", label: t.pages.home.categories.edit },
    { key: "convert", label: t.pages.home.categories.convert },
    { key: "security", label: t.pages.home.categories.security },
  ] as const;

  const WHY_UI = [
    { key: "fast", icon: Zap, accent: "#f59e0b", bg: "#fef3c7" },
    { key: "privacy", icon: Shield, accent: "#10b981", bg: "#ecfdf5" },
    { key: "access", icon: Globe, accent: "#3b82f6", bg: "#dbeafe" },
  ] as const;

  const FOOTER_GROUPS = [
    {
      label: t.pages.home.categories.organize,
      links: [
        { href: "/merge", label: t.pages.home.tools.merge.title },
        { href: "/split", label: t.pages.home.tools.split.title },
        { href: "/reorder", label: t.pages.home.tools.reorder.title },
        { href: "/rotate", label: t.pages.home.tools.rotate.title },
      ],
    },
    {
      label: t.pages.home.categories.edit,
      links: [
        { href: "/edit", label: t.pages.home.tools.edit.title },
        { href: "/compress", label: t.pages.home.tools.compress.title },
        { href: "/watermark", label: t.pages.home.tools.watermark.title },
        { href: "/page-numbers", label: t.pages.home.tools.pageNumbers.title },
      ],
    },
    {
      label: t.pages.home.categories.convert,
      links: [
        { href: "/pdf-to-image", label: t.pages.home.tools.pdfToImage.title },
        { href: "/image-to-pdf", label: t.pages.home.tools.imageToPdf.title },
      ],
    },
    {
      label: t.pages.home.categories.security,
      links: [
        { href: "/protect", label: t.pages.home.tools.protect.title },
        { href: "/unlock", label: t.pages.home.tools.unlock.title },
      ],
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Header activePath="/" />

      {/* ══════════════════════════════════════════════════════ HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-orange-50/30 to-white border-b border-[var(--border)]">
        {/* Animated gradient background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-screen-xl mx-auto px-5 pt-20 pb-24">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 py-2 px-4 text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg shadow-orange-500/25">
              <Star className="w-3.5 h-3.5 fill-white" />
              {t.pages.home.badge}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-center text-[clamp(2.2rem,5vw,3.75rem)] font-extrabold leading-[1.1] tracking-tight text-[var(--text)] max-w-3xl mx-auto text-balance mb-5">
            {t.pages.home.titlePrefix}{" "}
            <span
              className="relative inline-block bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent"
            >
              {t.pages.home.titleHighlight}
              <span
                className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-orange-500 to-red-500 opacity-60"
              />
            </span>
          </h1>

          <p className="text-center text-lg text-[var(--text-muted)] max-w-xl mx-auto mb-10 leading-relaxed">
            {t.pages.home.description}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/merge"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base px-7 py-4 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Upload className="w-5 h-5" />
              {t.pages.home.ctaPrimary}
              <ArrowRight className="w-4 h-4 opacity-80" />
            </Link>
            <a
              href="#tools"
              className="inline-flex items-center gap-2 bg-white hover:bg-orange-50 text-[var(--text-muted)] hover:text-[var(--text)] font-semibold text-base px-6 py-4 rounded-2xl border border-[var(--border)] hover:border-orange-300 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Layers className="w-4 h-4" />
              {t.pages.home.ctaSecondary}
            </a>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8">
            {t.pages.home.stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{s.value}</p>
                <p className="text-sm text-[var(--text-subtle)] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ TOOLS */}
      <section id="tools" className="max-w-screen-xl mx-auto px-5 py-16">
        {CATEGORIES.map((category) => {
          const items = TOOL_UI.filter((x) => x.category === category.key);
          return (
            <div key={category.key} className="mb-12">
              {/* Category heading */}
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-base font-bold text-[var(--text)]">{category.label}</h2>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-xs text-[var(--text-subtle)]">{items.length} {t.pages.home.toolsCountSuffix}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {items.map((tool) => {
                  const Icon = tool.icon;
                  const copy = t.pages.home.tools[tool.tKey as keyof typeof t.pages.home.tools];
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="group card-hover flex items-start gap-3.5 p-4"
                    >
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110"
                        style={{ background: tool.lightBg }}
                      >
                        <Icon className="w-5 h-5" style={{ color: tool.accent }} />
                      </div>

                      {/* Text */}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--text)] group-hover:text-orange-600 transition-colors leading-snug">
                          {copy.title}
                        </p>
                        <p className="text-xs text-[var(--text-subtle)] mt-0.5 leading-relaxed">
                          {copy.desc}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ArrowRight
                        className="w-4 h-4 text-[var(--border)] group-hover:text-orange-400 flex-shrink-0 ml-auto mt-1 transition-all duration-200 group-hover:translate-x-0.5"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* ══════════════════════════════════════════════════════ FEATURES */}
      <section className="border-t border-[var(--border)] bg-white py-16 px-5">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[var(--text)] tracking-tight mb-3">
              {t.pages.home.whyTitle}
            </h2>
            <p className="text-[var(--text-muted)] max-w-lg mx-auto">
              {t.pages.home.whySubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {WHY_UI.map((f) => {
              const Icon = f.icon;
              const item = t.pages.home.whyItems[f.key as keyof typeof t.pages.home.whyItems];
              return (
                <div key={f.key} className="card p-6 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: f.bg }}
                  >
                    <Icon className="w-7 h-7" style={{ color: f.accent }} />
                  </div>
                  <h3 className="font-bold text-[var(--text)] mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ TESTIMONIALS */}
      <section className="py-16 px-5" style={{ background: "var(--bg)" }}>
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[var(--text)] text-center mb-8 tracking-tight">
            {t.pages.home.testimonialsTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {t.pages.home.testimonials.map((it) => (
              <div key={it.name} className="card p-5">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
                  ))}
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">"{it.text}"</p>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{it.name}</p>
                  <p className="text-xs text-[var(--text-subtle)]">{it.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ CTA BANNER */}
      <section className="py-14 px-5 border-t border-[var(--border)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMCAwTDQwIDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
            {t.pages.home.ctaTitle}
          </h2>
          <p className="text-white/90 mb-8">
            {t.pages.home.ctaSubtitle}
          </p>
          <Link
            href="/merge"
            className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-bold text-base px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            <Upload className="w-5 h-5" />
            {t.pages.home.ctaButton}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ FOOTER */}
      <footer className="bg-white border-t border-[var(--border)] py-10 px-5">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            {/* Brand */}
            <div className="max-w-xs">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <FileType className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">
                  <span className="text-[var(--text)]">Doc</span>
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Flow</span>
                </span>
              </Link>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {t.pages.home.footer.desc}
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
              {FOOTER_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="font-bold text-[var(--text)] mb-3">{group.label}</p>
                  <ul className="space-y-2">
                    {group.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="text-[var(--text-muted)] hover:text-orange-500 transition-colors">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[var(--text-subtle)]">
              © {new Date().getFullYear()} DocFlow. {t.pages.home.copyright}
            </p>
            <div className="flex items-center gap-5 text-xs text-[var(--text-subtle)]">
              <a href="#" className="hover:text-brand-500 transition-colors">{t.pages.home.footer.about}</a>
              <a href="#" className="hover:text-brand-500 transition-colors">{t.pages.home.footer.privacy}</a>
              <a href="#" className="hover:text-brand-500 transition-colors">{t.pages.home.footer.faq}</a>
              <a href="#" className="hover:text-brand-500 transition-colors">{t.pages.home.footer.contact}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
