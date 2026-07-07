import { 
  FileText, 
  FileType, 
  FileSpreadsheet, 
  Image, 
  Lock, 
  MoreHorizontal, 
  RotateCw, 
  Scissors, 
  Upload,
  Download,
  CheckCircle2,
  Pencil
} from "lucide-react";

const tools = [
  {
    id: "merge",
    title: "Merge PDF",
    description: "Gabungkan beberapa PDF menjadi satu",
    icon: <FileType className="w-8 h-8 text-primary-600" />,
    color: "bg-primary-50",
  },
  {
    id: "split",
    title: "Split PDF",
    description: "Pisahkan PDF menjadi beberapa file",
    icon: <Scissors className="w-8 h-8 text-emerald-600" />,
    color: "bg-emerald-50",
  },
  {
    id: "compress",
    title: "Compress PDF",
    description: "Perkecil ukuran file PDF",
    icon: <FileText className="w-8 h-8 text-amber-600" />,
    color: "bg-amber-50",
  },
  {
    id: "edit",
    title: "Edit PDF",
    description: "Tambahkan teks, highlight, dan anotasi",
    icon: <Pencil className="w-8 h-8 text-red-600" />,
    color: "bg-red-50",
  },
  {
    id: "pdf-to-word",
    title: "PDF ke Word",
    description: "Konversi PDF ke dokumen Word",
    icon: <FileSpreadsheet className="w-8 h-8 text-violet-600" />,
    color: "bg-violet-50",
  },
  {
    id: "pdf-to-image",
    title: "PDF ke Gambar",
    description: "Ekstrak halaman PDF sebagai gambar",
    icon: <Image className="w-8 h-8 text-pink-600" />,
    color: "bg-pink-50",
  },
  {
    id: "rotate",
    title: "Rotate PDF",
    description: "Putar halaman PDF dengan mudah",
    icon: <RotateCw className="w-8 h-8 text-sky-600" />,
    color: "bg-sky-50",
  },
  {
    id: "protect",
    title: "Protect PDF",
    description: "Lindungi PDF dengan kata sandi",
    icon: <Lock className="w-8 h-8 text-red-600" />,
    color: "bg-red-50",
  },
  {
    id: "more",
    title: "Lainnya",
    description: "Lihat semua alat",
    icon: <MoreHorizontal className="w-8 h-8 text-slate-600" />,
    color: "bg-slate-50",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <FileType className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">DocFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-slate-600 hover:text-slate-900 text-sm font-medium">Semua Alat</a>
            <a href="#" className="text-slate-600 hover:text-slate-900 text-sm font-medium">Tentang</a>
            <a href="#" className="text-slate-600 hover:text-slate-900 text-sm font-medium">FAQ</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-white to-primary-50/30">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Alat PDF <span className="text-primary-600">Online</span> Terbaik
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Merge, split, compress, dan konversi PDF dengan cepat dan mudah. Semuanya gratis dan tanpa perlu mendaftar.
          </p>
          
          {/* Upload Area */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-10 hover:border-primary-400 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-700 mb-2">Letakkan file PDF di sini</p>
              <p className="text-slate-500 text-sm">atau klik untuk memilih file</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-10 text-center">Alat Populer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <a
                key={tool.id}
                href={`/${tool.id}`}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className={`w-14 h-14 ${tool.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{tool.title}</h3>
                <p className="text-sm text-slate-500">{tool.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Kenapa DocFlow?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <CheckCircle2 className="w-10 h-10 text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Gratis & Cepat</h3>
              <p className="text-slate-600">Semua alat kami gratis dan memproses file dengan kecepatan tinggi.</p>
            </div>
            <div className="text-center">
              <Lock className="w-10 h-10 text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Aman</h3>
              <p className="text-slate-600">File Anda dihapus secara otomatis setelah 1 jam.</p>
            </div>
            <div className="text-center">
              <Download className="w-10 h-10 text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Mudah Digunakan</h3>
              <p className="text-slate-600">Antarmuka yang sederhana dan intuitif untuk semua kalangan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FileType className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">DocFlow</span>
              </div>
              <p className="text-sm">Alat PDF online yang mudah, cepat, dan aman.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Alat</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Merge PDF</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Split PDF</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compress PDF</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontak</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Syarat Layanan</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>© 2025 DocFlow. Semua hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}