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
    <footer className="bg-slate-900/80 backdrop-blur-md border-t border-slate-700/50 py-10 px-5 text-slate-200 mt-auto">
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
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              {t.pages.home.footer.desc}
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm w-full md:w-auto flex-1 md:pl-10">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="font-bold text-white mb-3 tracking-wide">{group.label}</p>
                <ul className="space-y-2">
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-slate-300 font-medium hover:text-orange-400 transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-300 font-medium">
            © {new Date().getFullYear()} DocFlow. {t.pages.home.copyright}
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-300 font-medium">
            <Link href="/about" className="hover:text-orange-400 transition-colors">{t.pages.home.footer.about}</Link>
            <a href="#" className="hover:text-orange-400 transition-colors">{t.pages.home.footer.privacy}</a>
            <a href="#" className="hover:text-orange-400 transition-colors">{t.pages.home.footer.faq}</a>
            <a href="#" className="hover:text-orange-400 transition-colors">{t.pages.home.footer.contact}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
