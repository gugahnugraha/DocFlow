# DocFlow - PDF SaaS Application

[English](README.en.md) | [Indonesia](README.md)

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

Alat PDF online yang modern, cepat, dan 100% aman privasi. Memungkinkan pengguna untuk melakukan operasi pemrosesan PDF seperti Merge, Split, Compress, Rotate, Watermark, dan lainnya secara langsung.

## 🚀 Mengapa DocFlow?

DocFlow didesain dengan mengedepankan performa dan kenyamanan pengguna. Kami menggunakan teknologi mutakhir untuk memastikan operasi PDF dapat berjalan dengan cepat dan tanpa hambatan. Seluruh pemrosesan juga memastikan privasi penuh untuk dokumen Anda.

## 💻 Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **PDF Processing**: pdf-lib, pdfjs-dist, sharp
- **Background Workers**: BullMQ + Redis
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Internationalization**: Custom i18n (English & Indonesian)

## ✨ Fitur Tersedia

- ✅ **Merge PDF**: Gabungkan banyak PDF menjadi satu dokumen.
- ✅ **Split PDF**: Pisahkan dokumen PDF berdasarkan halaman.
- ✅ **Compress PDF**: Kurangi ukuran file PDF Anda dengan mudah.
- ✅ **Rotate PDF**: Putar halaman PDF ke posisi yang tepat.
- ✅ **Page Numbers**: Tambahkan nomor halaman ke dokumen PDF Anda.
- ✅ **Watermark PDF**: Beri tanda air khusus pada dokumen Anda untuk melindungi privasi.
- ✅ **Image to PDF**: Konversi gambar menjadi dokumen PDF berkualitas tinggi.
- 🚧 PDF ke Word/Gambar *(Coming Soon)*
- 🚧 Protect PDF *(Coming Soon)*

## 🛠️ Memulai (Getting Started)

### Prasyarat

Pastikan Anda telah menginstal beberapa dependensi berikut sebelum memulai:
- Node.js 18+
- PostgreSQL (dijalankan lokal atau via Docker)
- Redis

### Instalasi

1. Clone repository ini:
   ```bash
   git clone https://github.com/gugahnugraha/docflow.git
   ```
2. Pindah ke direktori proyek dan instal dependensi:
   ```bash
   cd docflow
   npm install
   ```
3. Salin konfigurasi `.env.example` ke `.env` dan isi variabel lingkungan (Database URL, Redis URL, dll).
4. Jalankan migrasi Prisma untuk menyiapkan database:
   ```bash
   npx prisma migrate dev
   ```
5. Jalankan development server:
   ```bash
   npm run dev
   ```
Aplikasi kini berjalan di `http://localhost:3000`.

## 📂 Struktur Proyek

```
docflow/
├── src/
│   ├── app/              # Next.js App Router (Halaman dan Layout)
│   ├── components/       # Komponen UI Reusable (React/shadcn)
│   ├── lib/              # Utility, Prisma client, dan library terpadu
│   └── hooks/            # Custom React hooks
├── prisma/               # Schema Prisma dan Migrasi
├── public/               # Aset statis (Gambar, ikon)
├── package.json
└── README.md
```

## 🤝 Kontribusi

Kami sangat terbuka dengan kontribusi! Silakan buat *pull request* jika Anda ingin menambahkan fitur baru, memperbaiki bug, atau meningkatkan dokumentasi.

## 💖 Dukung Kami (Donate)

Jika proyek ini bermanfaat bagi Anda, pertimbangkan untuk memberikan donasi agar kami dapat terus mengembangkan dan merawat DocFlow:

[![Donate](https://img.shields.io/badge/Donate-Support_Us-green)](/donate)

Anda juga dapat langsung mengunjungi halaman [Donasi](/donate) untuk mengetahui opsi dukungan lainnya.

## 📄 Lisensi

Proyek ini menggunakan lisensi **MIT**. Anda bebas untuk menggunakan, menyalin, memodifikasi, dan mendistribusikan perangkat lunak ini.
