# DocFlow - PDF SaaS Application

[English](README.en.md) | [Indonesia](README.md)

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

A modern, fast, and 100% privacy-safe online PDF tool. Allows users to perform PDF processing operations such as Merge, Split, Compress, Rotate, Watermark, and more directly in the browser.

## 🚀 Why DocFlow?

DocFlow is designed with performance and user convenience in mind. We use cutting-edge technology to ensure PDF operations run quickly and seamlessly. All processing also ensures full privacy for your documents.

## 💻 Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **PDF Processing**: pdf-lib, pdfjs-dist, sharp
- **Background Workers**: BullMQ + Redis
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Internationalization**: Custom i18n (English & Indonesian)

## ✨ Available Features

- ✅ **Merge PDF**: Combine multiple PDFs into a single document.
- ✅ **Split PDF**: Separate a PDF document by pages.
- ✅ **Compress PDF**: Reduce your PDF file size easily.
- ✅ **Rotate PDF**: Rotate PDF pages to the correct orientation.
- ✅ **Page Numbers**: Add page numbers to your PDF documents.
- ✅ **Watermark PDF**: Add custom watermarks to your documents to protect privacy.
- ✅ **Image to PDF**: Convert images into high-quality PDF documents.
- 🚧 PDF to Word/Image *(Coming Soon)*
- 🚧 Protect PDF *(Coming Soon)*

## 🛠️ Getting Started

### Prerequisites

Make sure you have installed the following dependencies before starting:
- Node.js 18+
- PostgreSQL (running locally or via Docker)
- Redis

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/gugahnugraha/docflow.git
   ```
2. Navigate to the project directory and install dependencies:
   ```bash
   cd docflow
   npm install
   ```
3. Copy the `.env.example` configuration to `.env` and fill in the environment variables (Database URL, Redis URL, etc.).
4. Run Prisma migrations to set up the database:
   ```bash
   npx prisma migrate dev
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
The application is now running at `http://localhost:3000`.

## 🚀 Vercel Deployment Guide

This project is configured and ready for a seamless deployment to Vercel.

1. Create a [Vercel](https://vercel.com) account if you don't have one.
2. Provision a cloud PostgreSQL database (e.g., using Supabase, Neon, or Vercel Postgres).
3. In your Vercel dashboard, click **Add New...** > **Project** and import your GitHub repository.
4. In the **Environment Variables** section, add the following configuration:
   - `DATABASE_URL`: Insert your cloud Postgres connection string.
   - Any other variables present in your `.env` file (like authentication configs).
5. Click **Deploy**.

*(Note: The build script is already configured to run `prisma generate && prisma migrate deploy` before building, so your database tables will be automatically created in production.)*

## 📂 Project Structure

```
docflow/
├── src/
│   ├── app/              # Next.js App Router (Pages and Layouts)
│   ├── components/       # Reusable UI Components (React/shadcn)
│   ├── lib/              # Utilities, Prisma client, and integrated libraries
│   └── hooks/            # Custom React hooks
├── prisma/               # Prisma Schema and Migrations
├── public/               # Static assets (Images, icons)
├── package.json
└── README.md
```

## 🤝 Contributing

We are very open to contributions! Please create a *pull request* if you want to add new features, fix bugs, or improve documentation.

## 💖 Support Us (Donate)

If this project is useful to you, consider making a donation so we can continue to develop and maintain DocFlow:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/gugahnugraha)
[![Trakteer](https://img.shields.io/badge/Trakteer-E12A39?style=for-the-badge&logo=trakteer&logoColor=white)](https://trakteer.id/gugahnugraha)

Or via PayPal: **paypal.me/gugahnugraha** (email: gugah.nugraha@example.com)

## 📄 License

This project is licensed under the **MIT** License. You are free to use, copy, modify, and distribute this software.
