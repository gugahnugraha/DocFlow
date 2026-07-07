# Panduan Setup DocFlow

## Langkah 1: Instalasi Dependensi

Pastikan Node.js 18+ sudah terinstal. Jalankan:

```bash
npm install
```

## Langkah 2: Konfigurasi Lingkungan

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi variabel lingkungan sesuai dengan konfigurasi Anda:

- `DATABASE_URL`: URL koneksi PostgreSQL Anda
- `REDIS_HOST`: Host Redis (default: localhost)
- `REDIS_PORT`: Port Redis (default: 6379)
- `NEXTAUTH_SECRET`: Secret key untuk NextAuth (generate dengan `openssl rand -hex 32`)
- `NEXTAUTH_URL`: URL aplikasi (default: http://localhost:3000)

## Langkah 3: Setup Database

Jalankan migrasi Prisma:

```bash
npx prisma migrate dev
```

## Langkah 4: Jalankan Aplikasi

Untuk development:

```bash
npm run dev
```

Untuk production:

```bash
npm run build
npm start
```

## Menjalankan Redis (untuk Workers)

Jika Anda menggunakan Docker:

```bash
docker run -p 6379:6379 redis
```

Atau install Redis secara lokal sesuai sistem operasi Anda.

## Fitur yang Tersedia

- ✅ Merge PDF: Gabungkan beberapa file PDF menjadi satu
- ✅ Split PDF: Pisahkan PDF menjadi beberapa file
- ✅ Compress PDF: Perkecil ukuran file PDF
- ✅ UI/UX Modern dan Profesional

## Struktur Proyek

```
docflow/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── merge/route.ts    # API Merge PDF
│   │   │   ├── split/route.ts    # API Split PDF
│   │   │   └── compress/route.ts # API Compress PDF
│   │   ├── merge/page.tsx        # Halaman Merge PDF
│   │   ├── split/page.tsx        # Halaman Split PDF
│   │   ├── compress/page.tsx     # Halaman Compress PDF
│   │   ├── page.tsx              # Homepage
│   │   ├── layout.tsx            # Root Layout
│   │   └── globals.css           # Global Styles
│   ├── components/ui/
│   │   └── button.tsx            # Komponen Button
│   └── lib/
│       ├── pdf.ts                # Utility PDF Processing
│       └── queue.ts              # Konfigurasi BullMQ
├── prisma/
│   └── schema.prisma             # Schema Database
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```
