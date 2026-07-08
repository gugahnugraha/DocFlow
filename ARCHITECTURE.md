# DocFlow Architecture Diagram

## System Overview

DocFlow is a PDF SaaS application built with Next.js 15 that provides various PDF manipulation tools (merge, split, compress, rotate, etc.) through a web interface.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Browser]
        HomePage[Home Page]
        ToolPages[Tool Pages<br/>merge, split, compress, etc.]
        DropZone[DropZone Component]
        PdfPreview[PdfPreview Component]
    end

    subgraph "Next.js App Layer"
        AppRouter[Next.js App Router]
        Layout[Root Layout]
        Header[Header Component]
        Toast[Toast Provider]
    end

    subgraph "API Layer"
        APIRoutes[API Routes]
        MergeAPI[/api/merge]
        SplitAPI[/api/split]
        CompressAPI[/api/compress]
        RotateAPI[/api/rotate]
        OtherAPIs[Other Tool APIs]
    end

    subgraph "Business Logic Layer"
        PDFLib[pdf-lib<br/>PDF Manipulation]
        PDFJS[pdfjs-dist<br/>PDF Rendering]
        Sharp[Sharp<br/>Image Processing]
        Queue[BullMQ Queue]
        Worker[BullMQ Worker]
    end

    subgraph "Infrastructure Layer"
        Redis[(Redis<br/>Job Queue)]
        PostgreSQL[(PostgreSQL<br/>Database)]
        Prisma[Prisma ORM]
    end

    subgraph "Data Models"
        User[User Model]
        Session[Session Model]
        Job[Job Model]
        Verification[VerificationToken]
    end

    Browser --> HomePage
    Browser --> ToolPages
    ToolPages --> DropZone
    ToolPages --> PdfPreview
    ToolPages --> AppRouter
    AppRouter --> Layout
    Layout --> Header
    Layout --> Toast
    
    ToolPages --> APIRoutes
    APIRoutes --> MergeAPI
    APIRoutes --> SplitAPI
    APIRoutes --> CompressAPI
    APIRoutes --> RotateAPI
    APIRoutes --> OtherAPIs
    
    MergeAPI --> PDFLib
    SplitAPI --> PDFLib
    CompressAPI --> PDFLib
    RotateAPI --> PDFLib
    OtherAPIs --> PDFLib
    
    PdfPreview --> PDFJS
    OtherAPIs --> Sharp
    
    MergeAPI --> Queue
    SplitAPI --> Queue
    Queue --> Worker
    Worker --> PDFLib
    Worker --> Redis
    
    APIRoutes --> Prisma
    Prisma --> PostgreSQL
    Prisma --> User
    Prisma --> Session
    Prisma --> Job
    Prisma --> Verification

    style Browser fill:#e1f5ff
    style HomePage fill:#fff4e6
    style ToolPages fill:#fff4e6
    style APIRoutes fill:#f0e6ff
    style PDFLib fill:#e6ffe6
    style PDFJS fill:#e6ffe6
    style Redis fill:#ffe6e6
    style PostgreSQL fill:#ffe6e6
```

## Component Details

### Frontend Components

**Core Components:**
- `DropZone.tsx` - File upload component with drag & drop support
- `Header.tsx` - Navigation header with tool links
- `PdfPreview.tsx` - PDF thumbnail preview component
- `PdfThumb.tsx` - Individual PDF page thumbnail
- `Button.tsx` - Reusable button component
- `Toast.tsx` - Toast notification system

**Page Structure:**
- `page.tsx` - Landing page with tool grid and features
- `merge/page.tsx` - PDF merge tool interface
- `split/page.tsx` - PDF split tool interface
- `compress/page.tsx` - PDF compression tool
- `rotate/page.tsx` - PDF rotation tool
- Other tool pages for edit, protect, unlock, watermark, etc.

### API Routes

Each tool has a corresponding API endpoint:
- `POST /api/merge` - Merge multiple PDFs
- `POST /api/split` - Split PDF at specified pages
- `POST /api/compress` - Compress PDF size
- `POST /api/rotate` - Rotate PDF pages
- `POST /api/protect` - Add password protection
- `POST /api/unlock` - Remove password protection
- `POST /api/watermark` - Add watermark
- `POST /api/page-numbers` - Add page numbers
- `POST /api/reorder` - Reorder pages
- `POST /api/pdf-to-image` - Convert PDF to images
- `POST /api/image-to-pdf` - Convert images to PDF

### Business Logic Libraries

**`lib/pdf.ts`** - Core PDF manipulation functions:
- `mergePDFs()` - Combines multiple PDF buffers
- `splitPDF()` - Splits PDF at specified page numbers
- `rotatePDF()` - Rotates all pages by specified degrees

**`lib/pdfRenderer.ts`** - PDF rendering utilities:
- `renderPage()` - Renders PDF page to canvas
- `loadPdf()` - Loads PDF from ArrayBuffer
- Implements render queue to prevent concurrent access issues

**`lib/queue.ts`** - Background job processing:
- BullMQ queue for async PDF operations
- Worker processes jobs: merge, split, rotate
- Redis connection for job queue

### Database Schema (Prisma)

**Models:**
- `User` - User accounts (name, email, image)
- `Session` - User sessions for NextAuth
- `VerificationToken` - Email verification tokens
- `Job` - Background job tracking (type, status, data, result)

## Data Flow

### Typical PDF Processing Flow

1. **User Upload**
   - User drops file into DropZone component
   - File validation (size, type)
   - Client-side preview using pdfjs-dist

2. **API Request**
   - Client sends FormData to API route
   - API validates request
   - Converts files to Buffers

3. **Processing**
   - **Synchronous**: Direct PDF processing using pdf-lib
   - **Asynchronous**: Job added to BullMQ queue
   - Worker processes job from Redis queue

4. **Response**
   - Processed PDF returned as binary
   - Headers set for download
   - Client triggers browser download

### Authentication Flow (NextAuth.js)

1. User initiates sign-in
2. NextAuth handles OAuth/email flow
3. Session created in database
4. User session managed via cookies
5. Protected routes check session validity

## Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

**PDF Processing:**
- pdf-lib - PDF manipulation
- pdfjs-dist - PDF rendering
- sharp - Image processing
- @napi-rs/canvas - Canvas operations

**Backend:**
- Node.js
- Next.js API Routes
- BullMQ - Job queue
- Redis - Queue storage
- Prisma ORM - Database access

**Database:**
- PostgreSQL - Primary database

**Authentication:**
- NextAuth.js v4

## Key Features

**Organization Tools:**
- Merge PDF
- Split PDF
- Reorder pages
- Rotate PDF

**Editing Tools:**
- Edit PDF
- Watermark
- Page numbers
- Compress PDF

**Conversion Tools:**
- PDF to Image
- Image to PDF

**Security Tools:**
- Protect PDF (password)
- Unlock PDF

## Deployment Considerations

- Redis instance required for BullMQ
- PostgreSQL database required
- Environment variables for database and Redis connections
- Static file serving for processed PDFs
- Worker process for background jobs
