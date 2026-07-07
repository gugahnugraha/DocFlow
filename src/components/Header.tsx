"use client";

import { useState, useRef, useEffect } from "react";
import { FileType, Menu, X, ChevronDown, Layers } from "lucide-react";

const TOOL_GROUPS = [
  {
    label: "Organisir PDF",
    color: "text-violet-600",
    bg: "bg-violet-50",
    tools: [
      { href: "/merge",   label: "Merge PDF",              desc: "Gabungkan beberapa PDF" },
      { href: "/split",   label: "Split PDF",              desc: "Pisahkan PDF menjadi bagian" },
      { href: "/reorder", label: "Susun Ulang Halaman",    desc: "Drag & drop urutan halaman" },
      { href: "/rotate",  label: "Rotate PDF",             desc: "Putar halaman PDF" },
    ],
  },
  {
    label: "Edit & Optimalkan",
    color: "text-brand-600",
    bg: "bg-brand-50",
    tools: [
      { href: "/edit",         label: "Edit PDF",          desc: "Teks, highlight, anotasi" },
      { href: "/compress",     label: "Compress PDF",      desc: "Perkecil ukuran file" },
      { href: "/page-numbers", label: "Nomor Halaman",     desc: "Tambah nomor halaman" },
      { href: "/watermark",    label: "Watermark PDF",     desc: "Tambahkan teks watermark" },
    ],
  },
  {
    label: "Konversi PDF",
    color: "text-pink-600",
    bg: "bg-pink-50",
    tools: [
      { href: "/pdf-to-image", label: "PDF ke Gambar",    desc: "Ekspor halaman sebagai JPG/PNG" },
      { href: "/image-to-pdf", label: "Gambar ke PDF",    desc: "Konversi JPG/PNG ke PDF" },
    ],
  },
  {
    label: "Keamanan PDF",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    tools: [
      { href: "/protect", label: "Protect PDF",            desc: "Tambah password ke PDF" },
      { href: "/unlock",  label: "Unlock PDF",             desc: "Hapus password dari PDF" },
    ],
  },
];

const QUICK_LINKS = [
  { href: "/merge",    label: "Merge" },
  { href: "/split",    label: "Split" },
  { href: "/compress", label: "Compress" },
  { href: "/edit",     label: "Edit" },
];

export default function Header({ activePath }: { activePath?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
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
    <header className="bg-white/90 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-5 h-[60px] flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <a href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-brand-sm group-hover:shadow-brand transition-shadow">
            <FileType className="w-4 h-4 text-white" />
          </div>
          <span className="text-[17px] font-bold tracking-tight">
            <span className="text-[var(--text)]">Doc</span>
            <span className="text-brand-500">Flow</span>
          </span>
        </a>

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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                dropdownOpen
                  ? "bg-brand-50 text-brand-600"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Semua Alat
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mega dropdown */}
            {dropdownOpen && (
              <div
                className="absolute top-full left-0 pt-2 z-50 w-[660px] animate-slide-up"
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
              >
                <div className="bg-white border border-[var(--border)] rounded-2xl shadow-[var(--shadow-lg)] p-5 grid grid-cols-2 gap-6">
                  {TOOL_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] font-bold text-[var(--text-subtle)] uppercase tracking-widest mb-2.5 px-1">
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.tools.map((tool) => (
                          <a
                            key={tool.href}
                            href={tool.href}
                            className={`flex items-start gap-2.5 px-2.5 py-2 rounded-xl transition-colors group ${
                              activePath === tool.href
                                ? "bg-brand-50"
                                : "hover:bg-[var(--bg)]"
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0 ${
                              activePath === tool.href ? "bg-brand-500" : "bg-[var(--border)] group-hover:bg-brand-300"
                            } transition-colors`} />
                            <div>
                              <p className={`text-[13px] font-semibold leading-tight ${
                                activePath === tool.href ? "text-brand-600" : "text-[var(--text)] group-hover:text-brand-600"
                              } transition-colors`}>
                                {tool.label}
                              </p>
                              <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">{tool.desc}</p>
                            </div>
                          </a>
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
            <a
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activePath === link.href
                  ? "text-brand-600 bg-brand-50"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="hidden md:block btn-ghost btn-sm rounded-xl text-sm font-semibold px-3 py-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
            Masuk
          </button>
          <button className="hidden md:flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-brand-sm hover:shadow-brand">
            Daftar Gratis
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-white animate-slide-up max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-5">
            {TOOL_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-bold text-[var(--text-subtle)] uppercase tracking-widest mb-2 px-1">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.tools.map((tool) => (
                    <a
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        activePath === tool.href
                          ? "bg-brand-50 text-brand-600"
                          : "text-[var(--text)] hover:bg-[var(--bg)]"
                      }`}
                    >
                      {tool.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-2">
              <button className="py-2.5 border border-[var(--border)] rounded-xl text-sm font-semibold text-[var(--text-muted)]">
                Masuk
              </button>
              <button className="py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold">
                Daftar Gratis
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
