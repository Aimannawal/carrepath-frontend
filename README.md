# 🚀 Carrepath Frontend

![Carrepath Banner](https://via.placeholder.com/1200x400/2B4DB6/FFFFFF?text=Carrepath+Career+Platform)

> Carrepath adalah platform karir terpadu yang menghubungkan **Job Seekers**, **Perusahaan**, dan **Penyedia Bootcamp** dalam satu ekosistem digital yang modern. Didukung dengan teknologi AI untuk membantu talenta muda meraih karir impian mereka secara optimal.

---

## ✨ Fitur Utama

Carrepath dirancang dengan 3 role utama yang saling terhubung:

### 👨‍💻 Untuk Pekerja (Job Seekers)
- **AI Resume Builder & Optimizer**: Buat CV ATS-friendly dalam hitungan detik. AI akan menganalisis dan mengoptimalkan deskripsi pengalamanmu.
- **CarrepathAI**: Asisten virtual pintar yang siap menjawab pertanyaan seputar karir, simulasi interview, dan memberikan rekomendasi lowongan secara personal.
- **Smart Study Plan**: Hasilkan roadmap belajar otomatis berbasis AI untuk menutupi *skill gap* demi mencapai posisi pekerjaan target.
- **Job & Bootcamp Explorer**: Cari lowongan kerja dan program pelatihan yang terkurasi.
- **Dashboard Lamaran**: Pantau status lamaran kerja dan bootcamp secara *real-time*.

### 🏢 Untuk Perusahaan (Company)
- **Job Management**: Posting lowongan pekerjaan baru dan kelola kriteria talenta yang dibutuhkan dengan mudah.
- **Applicant Tracking System**: Review, filter, dan kelola ribuan kandidat pelamar kerja dalam satu dasbor rapi.
- **Company Branding**: Buat profil perusahaan yang menarik dengan rekomendasi bootcamp khusus untuk calon pelamar.
- **Premium Analytics**: Insights performa rekrutmen perusahaan secara mendalam.

### 🎓 Untuk Penyedia Bootcamp (Provider)
- **Program Management**: Publikasikan program bootcamp (online/offline) lengkap dengan silabus dan harga.
- **Participant Tracking**: Kelola calon peserta yang mendaftar program bootcamp.
- **Provider Dashboard**: Kelola profil edukasi untuk meningkatkan kepercayaan publik.

---

## 🛠️ Teknologi & Stack

Proyek *frontend* ini dibangun dengan stack modern yang berfokus pada kecepatan, keamanan, dan *Developer Experience* (DX).

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3, Composition API)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Nuxt Icon](https://nuxt.com/modules/icon)
- **Package Manager**: [Bun](https://bun.sh/)
- **HTTP Client**: Nuxt `$fetch` (via composable `useApi`)

---

## 🚀 Panduan Memulai (Development)

Pastikan kamu sudah menginstal [Bun](https://bun.sh/) dan [Node.js](https://nodejs.org/) di komputermu.

### 1. Kloning & Install Dependensi
```bash
# Masuk ke direktori frontend
cd fe

# Install semua dependensi menggunakan Bun
bun install
```

### 2. Konfigurasi Environment
Buat file `.env` di *root directory* folder `fe` dan sesuaikan URL API dengan backend lokalmu:
```env
NUXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Jalankan Server Development
```bash
bun run dev
```
Buka *browser* pada alamat `http://localhost:3000`. Server *development* sudah dilengkapi dengan *Hot Module Replacement* (HMR).

### 4. Build untuk Production
```bash
# Build aplikasi untuk production
bun run build

# Menjalankan hasil build
bun run preview
```

---

## 📂 Struktur Folder Utama

```text
fe/
├── app/
│   ├── components/  # Komponen Vue yang reusable (JobCard, Modal, dll)
│   ├── composables/ # Logic functions global (useApi, useAuth, dll)
│   ├── layouts/     # Layout template halaman (default, worker, company, provider)
│   ├── pages/       # Rute halaman aplikasi berbasis file (file-based routing)
│   └── plugins/     # Konfigurasi plugin Nuxt (Pinia, dll)
├── public/          # Aset statis publik (images, favicon)
├── nuxt.config.ts   # Konfigurasi utama Nuxt & Tailwind
└── package.json     # Daftar dependensi & script project
```

---

## 🤝 Kontribusi

Kami sangat terbuka untuk kontribusi! Silakan ikuti standar kode yang sudah ada, buat *branch* terpisah untuk setiap fitur atau perbaikan *bug*, dan kirimkan *Pull Request*. Pastikan untuk selalu menjalankan `bun run lint` (jika ada) sebelum commit.

<p align="center">
  <b>Siap memulai karir Anda? Bergabunglah dengan ribuan pengguna Carrepath! 🌟</b>
</p>
