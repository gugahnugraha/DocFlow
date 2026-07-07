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
  { id: "merge",        title: "Merge PDF",            desc: "Gabungkan beberapa PDF menjadi satu",       icon: FileType,    accent: "#7c3aed", lightBg: "#f5f3ff", category: "Organisir" },
  { id: "split",        title: "Split PDF",            desc: "Pisahkan PDF menjadi beberapa file",         icon: Scissors,    accent: "#059669", lightBg: "#ecfdf5", category: "Organisir" },
  { id: "reorder",      title: "Susun Ulang Halaman",  desc: "Atur urutan halaman dengan drag & drop",     icon: ArrowDownUp, accent: "#0284c7", lightBg: "#e0f2fe", category: "Organisir" },
  { id: "rotate",       title: "Rotate PDF",           desc: "Putar halaman PDF sesuka kamu",              icon: RotateCw,    accent: "#0891b2", lightBg: "#ecfeff", category: "Organisir" },
  // Edit
  { id: "edit",         title: "Edit PDF",             desc: "Tambahkan teks, highlight, dan anotasi",    icon: Pencil,      accent: "#e64809", lightBg: "#fff2ee", category: "Edit" },
  { id: "watermark",    title: "Watermark PDF",        desc: "Tambahkan teks watermark ke setiap halaman", icon: Stamp,       accent: "#7c3aed", lightBg: "#f5f3ff", category: "Edit" },
  { id: "page-numbers", title: "Nomor Halaman",        desc: "Tambahkan nomor halaman dengan format kustom", icon: Hash,     accent: "#0d9488", lightBg: "#f0fdfa", category: "Edit" },
  { id: "compress",     title: "Compress PDF",         desc: "Perkecil ukuran file tanpa kehilangan kualitas", icon: FileText, accent: "#d97706", lightBg: "#fffbeb", category: "Edit" },
  // Konversi
  { id: "pdf-to-image", title: "PDF ke Gambar",        desc: "Ekspor halaman PDF sebagai JPG atau PNG",   icon: ImageIcon,   accent: "#db2777", lightBg: "#fdf2f8", category: "Konversi" },
  { id: "image-to-pdf", title: "Gambar ke PDF",        desc: "Konversi JPG, PNG menjadi dokumen PDF",     icon: Upload,      accent: "#e64809", lightBg: "#fff2ee", category: "Konversi" },
  // Keamanan
  { id: "protect",      title: "Protect PDF",          desc: "Lindungi PDF dengan kata sandi",             icon: Lock,        accent: "#dc2626", lightBg: "#fff1f2", category: "Keamanan" },
  { id: "unlock",       title: "Unlock PDF",           desc: "Hapus proteksi password dari PDF",           icon: LockOpen,    accent: "#16a34a", lightBg: "#f0fdf4", category: "Keamanan" },
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
    accent: "#d97706",
    bg: "#fffbeb",
  },
  {
    icon: Shield,
    title: "Privasi Terjaga",
    desc: "File kamu diproses dengan aman. Tidak ada yang disimpan di server kami setelah proses selesai.",
    accent: "#059669",
    bg: "#ecfdf5",
  },
  {
    icon: Globe,
    title: "Akses di Mana Saja",
    desc: "Buka dari browser apa pun — laptop, tablet, atau ponsel. Tidak perlu akun atau aplikasi tambahan.",
    accent: "#0284c7",
    bg: "#e0f2fe",
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
      <section className="relative overflow-hidden bg-white border-b border-[var(--border)]">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Warm glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #e64809 0%, transparent 70%)" }} />

        <div className="relative max-w-screen-xl mx-auto px-5 pt-20 pb-24">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="badge-brand py-1.5 px-4 text-sm">
              <Star className="w-3.5 h-3.5" />
              12 alat PDF gratis — tanpa daftar
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-center text-[clamp(2.2rem,5vw,3.75rem)] font-extrabold leading-[1.1] tracking-tight text-[var(--text)] max-w-3xl mx-auto text-balance mb-5">
            Semua yang kamu butuhkan untuk{" "}
            <span
              className="relative inline-block"
              style={{ color: "var(--brand)" }}
            >
              dokumen PDF
              <span
                className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full"
                style={{ background: "var(--brand)", opacity: 0.3 }}
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
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-base px-7 py-4 rounded-2xl shadow-brand hover:shadow-brand transition-all duration-150"
            >
              <Upload className="w-5 h-5" />
              Mulai Sekarang — Gratis
              <ArrowRight className="w-4 h-4 opacity-80" />
            </a>
            <a
              href="#tools"
              className="inline-flex items-center gap-2 bg-white hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] font-semibold text-base px-6 py-4 rounded-2xl border border-[var(--border)] transition-colors"
            >
              <Layers className="w-4 h-4" />
              Lihat semua alat
            </a>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold" style={{ color: "var(--brand)" }}>{s.value}</p>
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
      <section className="py-14 px-5 border-t border-[var(--border)]" style={{ background: "var(--brand)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
            Siap mulai? Gratis selamanya.
          </h2>
          <p className="text-white/80 mb-8">
            Tidak perlu kartu kredit. Tidak perlu daftar. Langsung pakai.
          </p>
          <a
            href="/merge"
            className="inline-flex items-center gap-2 bg-white text-brand-600 hover:bg-brand-50 font-bold text-base px-8 py-4 rounded-2xl transition-colors shadow-lg"
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
