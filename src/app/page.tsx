import {
  FileType, Scissors, FileText, Pencil, ImageIcon,
  Lock, LockOpen, RotateCw, ArrowDownUp, Hash,
  Stamp, Upload, Zap, Shield, Globe, ArrowRight,
  Layers, Star,
} from "lucide-react";
import Header from "@/components/Header";

/* ─── Tool definitions ─────────────────────────────────────────────────────── */
const TOOLS = [
  // Organisir
  { id: "merge",        title: "Merge PDF",            desc: "Gabungkan beberapa PDF menjadi satu",       icon: FileType,    accent: "#8b5cf6", lightBg: "#f5f3ff", category: "Organisir" },
  { id: "split",        title: "Split PDF",            desc: "Pisahkan PDF menjadi beberapa file",         icon: Scissors,    accent: "#10b981", lightBg: "#ecfdf5", category: "Organisir" },
  { id: "reorder",      title: "Susun Ulang Halaman",  desc: "Atur urutan halaman dengan drag & drop",     icon: ArrowDownUp, accent: "#3b82f6", lightBg: "#dbeafe", category: "Organisir" },
  { id: "rotate",       title: "Rotate PDF",           desc: "Putar halaman PDF sesuka kamu",              icon: RotateCw,    accent: "#06b6d4", lightBg: "#cffafe", category: "Organisir" },
  // Edit
  { id: "edit",         title: "Edit PDF",             desc: "Tambahkan teks, highlight, dan anotasi",    icon: Pencil,      accent: "#f97316", lightBg: "#ffedd5", category: "Edit" },
  { id: "watermark",    title: "Watermark PDF",        desc: "Tambahkan teks watermark ke setiap halaman", icon: Stamp,       accent: "#8b5cf6", lightBg: "#f5f3ff", category: "Edit" },
  { id: "page-numbers", title: "Nomor Halaman",        desc: "Tambahkan nomor halaman dengan format kustom", icon: Hash,     accent: "#14b8a6", lightBg: "#ccfbf1", category: "Edit" },
  { id: "compress",     title: "Compress PDF",         desc: "Perkecil ukuran file tanpa kehilangan kualitas", icon: FileText, accent: "#f59e0b", lightBg: "#fef3c7", category: "Edit" },
  // Konversi
  { id: "pdf-to-image", title: "PDF ke Gambar",        desc: "Ekspor halaman PDF sebagai JPG atau PNG",   icon: ImageIcon,   accent: "#ec4899", lightBg: "#fce7f3", category: "Konversi" },
  { id: "image-to-pdf", title: "Gambar ke PDF",        desc: "Konversi JPG, PNG menjadi dokumen PDF",     icon: Upload,      accent: "#f97316", lightBg: "#ffedd5", category: "Konversi" },
  // Keamanan
  { id: "protect",      title: "Protect PDF",          desc: "Lindungi PDF dengan kata sandi",             icon: Lock,        accent: "#ef4444", lightBg: "#fee2e2", category: "Keamanan" },
  { id: "unlock",       title: "Unlock PDF",           desc: "Hapus proteksi password dari PDF",           icon: LockOpen,    accent: "#22c55e", lightBg: "#dcfce7", category: "Keamanan" },
];

const CATEGORIES = ["Organisir", "Edit", "Konversi", "Keamanan"] as const;

const STATS = [
  { value: "12+",    label: "Alat PDF gratis" },
  { value: "100%",   label: "Tanpa instalasi" },
  { value: "Gratis", label: "Tanpa daftar" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Cepat & Ringan",
    desc: "Proses PDF langsung di browser dalam hitungan detik — tidak perlu menunggu upload ke server.",
    accent: "#f59e0b",
    bg: "#fef3c7",
  },
  {
    icon: Shield,
    title: "Privasi Terjaga",
    desc: "File kamu diproses dengan aman. Tidak ada yang disimpan di server kami setelah proses selesai.",
    accent: "#10b981",
    bg: "#ecfdf5",
  },
  {
    icon: Globe,
    title: "Akses di Mana Saja",
    desc: "Buka dari browser apa pun — laptop, tablet, atau ponsel. Tidak perlu akun atau aplikasi tambahan.",
    accent: "#3b82f6",
    bg: "#dbeafe",
  },
];

const TESTIMONIALS = [
  { name: "Rina S.",    role: "Staf Administrasi",    text: "Sangat mudah digunakan! Merge PDF tidak pernah semudah ini." },
  { name: "Budi P.",    role: "Mahasiswa",            text: "Compress PDF langsung dari browser tanpa instal apapun — luar biasa." },
  { name: "Dewi K.",    role: "Manajer Proyek",       text: "Fitur watermark dan nomor halaman sangat membantu pekerjaan harian saya." },
];

/* ─── Component ────────────────────────────────────────────────────────────── */
export default function Home() {
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
              12 alat PDF gratis — tanpa daftar
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-center text-[clamp(2.2rem,5vw,3.75rem)] font-extrabold leading-[1.1] tracking-tight text-[var(--text)] max-w-3xl mx-auto text-balance mb-5">
            Semua yang kamu butuhkan untuk{" "}
            <span
              className="relative inline-block bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent"
            >
              dokumen PDF
              <span
                className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-orange-500 to-red-500 opacity-60"
              />
            </span>
          </h1>

          <p className="text-center text-lg text-[var(--text-muted)] max-w-xl mx-auto mb-10 leading-relaxed">
            Merge, split, compress, rotate, watermark, konversi, dan lindungi PDF —
            semuanya online, gratis, dan langsung dari browser.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <a
              href="/merge"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base px-7 py-4 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Upload className="w-5 h-5" />
              Mulai Sekarang — Gratis
              <ArrowRight className="w-4 h-4 opacity-80" />
            </a>
            <a
              href="#tools"
              className="inline-flex items-center gap-2 bg-white hover:bg-orange-50 text-[var(--text-muted)] hover:text-[var(--text)] font-semibold text-base px-6 py-4 rounded-2xl border border-[var(--border)] hover:border-orange-300 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Layers className="w-4 h-4" />
              Lihat semua alat
            </a>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8">
            {STATS.map((s) => (
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
          const items = TOOLS.filter((t) => t.category === category);
          return (
            <div key={category} className="mb-12">
              {/* Category heading */}
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-base font-bold text-[var(--text)]">{category}</h2>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-xs text-[var(--text-subtle)]">{items.length} alat</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {items.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <a
                      key={tool.id}
                      href={`/${tool.id}`}
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
                        <p className="text-sm font-bold text-[var(--text)] group-hover:text-brand-600 transition-colors leading-snug">
                          {tool.title}
                        </p>
                        <p className="text-xs text-[var(--text-subtle)] mt-0.5 leading-relaxed">
                          {tool.desc}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ArrowRight
                        className="w-4 h-4 text-[var(--border)] group-hover:text-brand-400 flex-shrink-0 ml-auto mt-1 transition-all duration-200 group-hover:translate-x-0.5"
                      />
                    </a>
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
              Kenapa pilih DocFlow?
            </h2>
            <p className="text-[var(--text-muted)] max-w-lg mx-auto">
              Dirancang untuk kecepatan, kemudahan, dan privasi — tanpa kompromi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card p-6 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: f.bg }}
                  >
                    <Icon className="w-7 h-7" style={{ color: f.accent }} />
                  </div>
                  <h3 className="font-bold text-[var(--text)] mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
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
            Dipercaya ribuan pengguna
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card p-5">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
                  ))}
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{t.name}</p>
                  <p className="text-xs text-[var(--text-subtle)]">{t.role}</p>
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
            Siap mulai? Gratis selamanya.
          </h2>
          <p className="text-white/90 mb-8">
            Tidak perlu kartu kredit. Tidak perlu daftar. Langsung pakai.
          </p>
          <a
            href="/merge"
            className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-bold text-base px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            <Upload className="w-5 h-5" />
            Coba Sekarang
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ FOOTER */}
      <footer className="bg-white border-t border-[var(--border)] py-10 px-5">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            {/* Brand */}
            <div className="max-w-xs">
              <a href="/" className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                  <FileType className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">
                  <span className="text-[var(--text)]">Doc</span>
                  <span className="text-brand-500">Flow</span>
                </span>
              </a>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Platform alat PDF online gratis. Tidak perlu instalasi, tidak perlu daftar.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
              {TOOL_GROUPS_FOOTER.map((group) => (
                <div key={group.label}>
                  <p className="font-bold text-[var(--text)] mb-3">{group.label}</p>
                  <ul className="space-y-2">
                    {group.links.map((l) => (
                      <li key={l.href}>
                        <a href={l.href} className="text-[var(--text-muted)] hover:text-brand-500 transition-colors">
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[var(--text-subtle)]">
              © {new Date().getFullYear()} DocFlow. Gratis untuk semua.
            </p>
            <div className="flex items-center gap-5 text-xs text-[var(--text-subtle)]">
              <a href="#" className="hover:text-brand-500 transition-colors">Tentang</a>
              <a href="#" className="hover:text-brand-500 transition-colors">Privasi</a>
              <a href="#" className="hover:text-brand-500 transition-colors">FAQ</a>
              <a href="#" className="hover:text-brand-500 transition-colors">Kontak</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const TOOL_GROUPS_FOOTER = [
  {
    label: "Organisir",
    links: [
      { href: "/merge",   label: "Merge PDF" },
      { href: "/split",   label: "Split PDF" },
      { href: "/reorder", label: "Susun Halaman" },
      { href: "/rotate",  label: "Rotate PDF" },
    ],
  },
  {
    label: "Edit",
    links: [
      { href: "/edit",         label: "Edit PDF" },
      { href: "/compress",     label: "Compress PDF" },
      { href: "/watermark",    label: "Watermark" },
      { href: "/page-numbers", label: "Nomor Halaman" },
    ],
  },
  {
    label: "Konversi",
    links: [
      { href: "/pdf-to-image", label: "PDF ke Gambar" },
      { href: "/image-to-pdf", label: "Gambar ke PDF" },
    ],
  },
  {
    label: "Keamanan",
    links: [
      { href: "/protect", label: "Protect PDF" },
      { href: "/unlock",  label: "Unlock PDF" },
    ],
  },
];
