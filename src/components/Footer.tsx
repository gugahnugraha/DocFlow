"use client";

import Link from "next/link";
import { FileType } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { usePathname } from "next/navigation";

const WORKSPACE_PATHS = [
  "/merge", "/split", "/reorder", "/rotate",
  "/edit", "/watermark", "/page-numbers", "/compress",
  "/pdf-to-image", "/image-to-pdf", "/protect", "/unlock"
];

export default function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();

  // Hide footer on workspace (tool) pages
  if (pathname && WORKSPACE_PATHS.some((p) => pathname.startsWith(p))) {
    return null;
  }

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
    <footer className="bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 py-12 md:py-16 px-5 mt-auto">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2 mb-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <FileType className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-white">Doc</span>
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Flow</span>
              </span>
            </Link>
            <p className="text-[13px] text-slate-400 leading-relaxed font-medium mt-2">
              {t.pages.home.footer.desc}
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm w-full md:w-auto flex-1 md:pl-10">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[11px] uppercase tracking-[0.15em] font-extrabold text-slate-500 mb-4">{group.label}</p>
                <ul className="space-y-3">
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[13px] font-semibold text-slate-400 hover:text-orange-400 transition-colors duration-300">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-slate-500 font-medium">
            © {new Date().getFullYear()} DocFlow. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-[13px] font-semibold text-slate-500">
            <Link href="/about" className="hover:text-slate-300 transition-colors duration-300">{t.pages.home.footer.about}</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors duration-300">{t.pages.home.footer.privacy}</Link>
            <Link href="/faq" className="hover:text-slate-300 transition-colors duration-300">{t.pages.home.footer.faq}</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors duration-300">{t.pages.home.footer.contact}</Link>
            <Link href="/donate" className="hover:text-slate-300 transition-colors duration-300">{t.pages.home.footer.donate}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
