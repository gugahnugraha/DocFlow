"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { FileType, Menu, X, ChevronDown, Layers, LogOut, User, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Header({ activePath }: { activePath?: string }) {
  const { data: session } = useSession();
  const { t, language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TOOL_GROUPS = [
    {
      label: t.header.toolGroups.organize,
      color: "text-violet-600",
      bg: "bg-violet-50",
      tools: [
        { href: "/merge",   label: t.header.tools.merge.label,              desc: t.header.tools.merge.desc },
        { href: "/split",   label: t.header.tools.split.label,              desc: t.header.tools.split.desc },
        { href: "/reorder", label: t.header.tools.reorder.label,    desc: t.header.tools.reorder.desc },
        { href: "/rotate",  label: t.header.tools.rotate.label,             desc: t.header.tools.rotate.desc },
      ],
    },
    {
      label: t.header.toolGroups.editOptimize,
      color: "text-orange-600",
      bg: "bg-orange-50",
      tools: [
        { href: "/edit",         label: t.header.tools.edit.label,          desc: t.header.tools.edit.desc },
        { href: "/compress",     label: t.header.tools.compress.label,      desc: t.header.tools.compress.desc },
        { href: "/page-numbers", label: t.header.tools.pageNumbers.label,     desc: t.header.tools.pageNumbers.desc },
        { href: "/watermark",    label: t.header.tools.watermark.label,     desc: t.header.tools.watermark.desc },
      ],
    },
    {
      label: t.header.toolGroups.convert,
      color: "text-pink-600",
      bg: "bg-pink-50",
      tools: [
        { href: "/pdf-to-image", label: t.header.tools.pdfToImage.label,    desc: t.header.tools.pdfToImage.desc },
        { href: "/image-to-pdf", label: t.header.tools.imageToPdf.label,    desc: t.header.tools.imageToPdf.desc },
      ],
    },
    {
      label: t.header.toolGroups.security,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      tools: [
        { href: "/protect", label: t.header.tools.protect.label,            desc: t.header.tools.protect.desc },
        { href: "/unlock",  label: t.header.tools.unlock.label,             desc: t.header.tools.unlock.desc },
      ],
    },
  ];

  const QUICK_LINKS = [
    { href: "/merge",    label: t.header.quickLinks.merge },
    { href: "/split",    label: t.header.quickLinks.split },
    { href: "/compress", label: t.header.quickLinks.compress },
    { href: "/edit",     label: t.header.quickLinks.edit },
    { href: "/about",    label: t.header.about },
  ];

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // close mobile menu on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const openDropdown  = () => { if (timerRef.current) clearTimeout(timerRef.current); setDropdownOpen(true); };
  const closeDropdown = () => { timerRef.current = setTimeout(() => setDropdownOpen(false), 120); };

  return (
    <header className="bg-white/55 backdrop-blur-xl border-b border-white/30 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-5 h-[60px] flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-xl group-hover:shadow-orange-500/40 transition-all duration-300">
            <FileType className="w-4 h-4 text-white" />
          </div>
          <span className="text-[17px] font-bold tracking-tight">
            <span className="text-[var(--text)]">Doc</span>
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Flow</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 px-4">

          {/* All Tools dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdown}
          >
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                dropdownOpen
                  ? "bg-orange-50 text-orange-600"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {t.header.allTools}
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mega dropdown */}
            {dropdownOpen && (
              <div
                className="absolute top-full left-0 pt-2 z-50 w-[min(660px,calc(100vw-2.5rem))] animate-slide-up"
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
              >
                <div className="bg-white/65 backdrop-blur-xl border border-white/30 rounded-2xl shadow-[0_20px_45px_-30px_rgba(15,23,42,0.55)] p-5 grid grid-cols-2 gap-6">
                  {TOOL_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] font-bold text-[var(--text-subtle)] uppercase tracking-widest mb-2.5 px-1">
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.tools.map((tool) => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            className={`flex items-start gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 group ${
                              activePath === tool.href
                                ? "bg-orange-50"
                                : "hover:bg-[var(--bg)]"
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0 ${
                              activePath === tool.href ? "bg-orange-500" : "bg-[var(--border)] group-hover:bg-orange-300"
                            } transition-colors`} />
                            <div>
                              <p className={`text-[13px] font-semibold leading-tight ${
                                activePath === tool.href ? "text-orange-600" : "text-[var(--text)] group-hover:text-orange-600"
                              } transition-colors`}>
                                {tool.label}
                              </p>
                              <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">{tool.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <span className="w-px h-4 bg-[var(--border)] mx-1" />

          {/* Quick links */}
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activePath === link.href
                  ? "text-orange-600 bg-orange-50"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Language Toggle */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen(v => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors"
            >
              <Globe className="w-5 h-5" />
            </button>
            {langMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-white/70 backdrop-blur-xl border border-white/30 rounded-xl shadow-[0_18px_40px_-26px_rgba(15,23,42,0.55)] p-2">
                <button
                  onClick={() => { setLanguage("id"); setLangMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    language === "id" 
                      ? "text-orange-600 bg-orange-50" 
                      : "text-[var(--text-muted)] hover:bg-[var(--bg)]"
                  }`}
                >
                  🇮🇩 {t.common.languages.id}
                </button>
                <button
                  onClick={() => { setLanguage("en"); setLangMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    language === "en" 
                      ? "text-orange-600 bg-orange-50" 
                      : "text-[var(--text-muted)] hover:bg-[var(--bg)]"
                  }`}
                >
                  🇺🇸 {t.common.languages.en}
                </button>
              </div>
            )}
          </div>

          {session?.user ? (
            // User is logged in
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--bg)] transition-all duration-200"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || t.common.user.fallbackAlt}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold">
                    {session.user.name?.[0] || t.common.user.fallbackInitial}
                  </div>
                )}
                <span className="text-sm font-semibold text-[var(--text)]">
                  {session.user.name}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white/70 backdrop-blur-xl border border-white/30 rounded-xl shadow-[0_18px_40px_-26px_rgba(15,23,42,0.55)] p-2">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    {t.header.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // User is not logged in
            <>
              <Link
                href="/login"
                className="hidden md:block btn-ghost btn-sm rounded-xl text-sm font-semibold px-3 py-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-all duration-200"
              >
                {t.header.login}
              </Link>
              <Link
                href="/signup"
                className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5"
              >
                {t.header.signup}
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? t.header.mobileMenuAria.close : t.header.mobileMenuAria.open}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/30 bg-white/65 backdrop-blur-xl animate-slide-up max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-5">
            {TOOL_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-bold text-[var(--text-subtle)] uppercase tracking-widest mb-2 px-1">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        activePath === tool.href
                          ? "bg-orange-50 text-orange-600"
                          : "text-[var(--text)] hover:bg-[var(--bg)]"
                      }`}
                    >
                      {tool.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-[var(--border)] space-y-2">
              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activePath === "/about"
                    ? "bg-orange-50 text-orange-600"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
                }`}
              >
                {t.header.about}
              </Link>
              {/* Mobile Language Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLanguage("id")}
                  className={`py-2.5 border rounded-xl text-sm font-semibold transition-all duration-200 ${
                    language === "id" 
                      ? "border-orange-500 bg-orange-50 text-orange-600" 
                      : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)]"
                  }`}
                >
                  🇮🇩 {t.common.languages.id}
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`py-2.5 border rounded-xl text-sm font-semibold transition-all duration-200 ${
                    language === "en" 
                      ? "border-orange-500 bg-orange-50 text-orange-600" 
                      : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)]"
                  }`}
                >
                  🇺🇸 {t.common.languages.en}
                </button>
              </div>
              
              {/* Auth Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {session?.user ? (
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="col-span-2 py-2.5 border border-red-200 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    {t.header.logout}
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="py-2.5 border border-[var(--border)] rounded-xl text-sm font-semibold text-[var(--text-muted)] text-center"
                    >
                      {t.header.login}
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-semibold text-center"
                    >
                      {t.header.signup}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
