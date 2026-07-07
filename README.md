# DocFlow - PDF SaaS Application

Alat PDF online yang mudah, cepat, dan aman. Merge, split, compress, dan konversi PDF dengan mudah.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui
- **PDF Processing**: pdf-lib, pdfjs-dist, sharp
- **Background Workers**: BullMQ + Redis
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js

## Fitur

- ✅ Merge PDF
- ✅ Split PDF
- ✅ Compress PDF
- ✅ Rotate PDF
- ✅ PDF ke Word/Gambar (coming soon)
- ✅ Protect PDF (coming soon)

## Memulai

### Prasyarat

- Node.js 18+
- PostgreSQL
- Redis

### Instalasi

1. Clone repository
2. Install dependensi:
   ```bash
   npm install
   ```
3. Salin `.env.example` ke `.env` dan isi variabel lingkungan
4. Jalankan migrasi Prisma:
   ```bash
   npx prisma migrate dev
   ```
5. Jalankan development server:
   ```bash
   npm run dev
   ```

## Struktur Proyek

```
docflow/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Komponen React
│   └── lib/              # Utility dan library
├── prisma/               # Schema Prisma
├── package.json
└── README.md
```

## Lisensi

MIT
