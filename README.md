# Carrepath Frontend

Frontend Carrepath dibangun dengan Nuxt 3 + Vue 3 untuk menangani flow worker, company, admin, resume AI, job application, dan pembayaran premium.

## Fitur Utama

- Worker dashboard, job browsing, apply job, saved companies, transactions, dan upgrade premium.
- Company dashboard, manage jobs, applicants, account center, dan premium package.
- Resume AI dengan 2 mode utama:
	- Study Plan Workspace
	- CV ATS Preview + download PDF
- Upload profile image dan upload PDF CV dengan handling warning backend yang non-fatal.
- Mapping response backend dibuat defensif untuk variasi shape nested/top-level.

## Struktur Singkat

- `app/pages/worker/*` - halaman worker.
- `app/pages/company/*` - halaman company.
- `app/pages/admin/*` - halaman admin.
- `app/composables/*` - helper untuk auth, fetch, upload, dan response mapping.
- `app/components/*` - komponen reusable untuk job, company, dan modal.

## Setup

Pastikan dependency terpasang:

```bash
bun install
```

Jalankan project:

```bash
bun run dev
```

Build production:

```bash
bun run build
```

Preview hasil production build:

```bash
bun run preview
```

## Environment

Buat file `.env` di root project jika belum ada.

Contoh:

```bash
NUXT_PUBLIC_API_URL=http://localhost:8080
```

Catatan:

- Token auth dibaca dari cookie `access_token`.
- Role user dibaca dari cookie `user_role`.
- Jika `NUXT_PUBLIC_API_URL` tidak diisi, default ke `http://localhost:8080`.

## Flow Penting Yang Sudah Dipakai FE

- Save company: `POST /saved/company`
- Detail job: `GET /jobs/:id`
- List jobs: `GET /jobs`
- Apply job: `POST /applications`
- Applicants list/status: `GET /applications/job/:job_id`, `PUT /applications/:id/status`
- Upload profile image: `POST /storage/upload/profile/:user_id`
- Upload PDF CV: `POST /storage/upload/pdf/:worker_id`
- Resume AI: `POST /ai/generate-resume`, `POST /ai/optimize-resume`, `POST /ai/study-plan`
- Resume history: `GET /ai/resumes/:worker_id`, `GET /ai/study-plans/:worker_id`
- Payment: `GET /payment/packages`, `POST /payment/transaction`, `PUT /payment/transaction/:id/confirm`, `GET /payment/transactions/:user_id`

## Kontribusi / Development Notes

- Gunakan composable yang sudah ada: `useApi`, `useApiResponse`, `useAuth`, `useFileUpload`, dan `usePageFetch`.
- Prioritaskan inline error/success message, jangan pakai browser alert.
- Untuk response backend yang bentuknya berbeda-beda, gunakan helper parsing dari `useApiResponse`.
- Untuk resume PDF, frontend memakai PDF.js untuk ekstraksi teks sebelum mengirim ke endpoint optimize.

## Dokumentasi Nuxt

Referensi resmi:

- https://nuxt.com/docs/getting-started/introduction
- https://nuxt.com/docs/getting-started/deployment
