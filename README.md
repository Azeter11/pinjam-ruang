# 🏛️ Pinjam Ruang — Smart Campus Room Booking System

Aplikasi peminjaman ruangan kampus berbasis **Next.js 14 (App Router)** sebagai Klien dan **Express.js** sebagai Server, dilengkapi fitur *realtime*, autentikasi, dan panel admin.

---

## 🌐 Arsitektur Sistem Terdistribusi
Aplikasi ini mengimplementasikan arsitektur *Client-Server* dua-tingkat (*Two-tier architecture* / *n-tier architecture*) dengan sistem terdistribusi. Logika bisnis dipisah menjadi beberapa simpul (*nodes*) yang berkomunikasi melalui jaringan.

**Dimana dan Bagaimana Diterapkan:**
1. **Frontend Node (Client - Next.js):** 
   Berperan sebagai simpul presentasi yang diakses pengguna melalui browser. Simpul ini bertanggung jawab me-render antarmuka, mengelola state UI lokal, serta memvalidasi masukan awal.
2. **Backend Node (Server - Express.js):** 
   Berperan sebagai simpul komputasi utama (API Gateway) yang terpusat. Menerima permintaan, menjalankan proses logika bisnis (seperti validasi bentrok jadwal), dan mengirim notifikasi realtime.
3. **Data Server Node (Database - MySQL):** 
   Simpul penyimpanan terpusat yang menangani persistensi dan integritas data (ACID) terkait entitas pengguna, ruangan, dan histori peminjaman.
4. **Komunikasi antar Simpul (Network Communication):**
   - **REST API (HTTP):** Digunakan untuk komunikasi *request-response* standar antara Klien dan Server (misal: saat form disubmit atau saat mengambil list ruangan).
   - **WebSocket (Socket.IO):** Digunakan untuk komunikasi *full-duplex asinkron* yang *realtime*. Jika admin menyetujui jadwal ruangan, server akan memancarkan (emit) *event* ke semua klien yang terhubung sehingga status ruangan di layar pengguna akan ter-update tanpa perlu *refresh*.

---

## 📁 Struktur Direktori & Fungsi Logika

Proyek ini dibagi menjadi dua bagian utama (Monorepo-style setup): `Frontend` (root) dan `Backend` (`/backend/`).

### 1. Frontend (Klien - Root Directory)
*   **`src/app/`**: Struktur routing halaman Next.js App Router (berisi `page.tsx` dan `layout.tsx` untuk dashboard, admin, peminjaman).
*   **`src/components/`**: Berisi komponen UI modular yang dapat digunakan kembali (*reusable*), seperti form, tombol, modal, tabel, dan card.
*   **`src/hooks/`**: Custom hooks React, terutama menampung logika *data fetching* menggunakan React Query agar komponen UI tetap bersih.
*   **`src/services/`**: Layer abstraksi *HTTP Client* (Axios) yang berisi fungsi-fungsi untuk memanggil endpoint API Backend.
*   **`src/store/`**: Tempat konfigurasi manajemen *state global* aplikasi menggunakan Zustand (contoh: status login, data user).
*   **`src/lib/`**: Fungsi utilitas pembantu (helper) seperti pemformatan tanggal, waktu, atau manipulasi string.
*   **`src/types/`**: Kumpulan definisi *interface* dan tipe data TypeScript agar frontend aman dari error ketidakcocokan tipe (*type-safe*).

### 2. Backend (Server - `/backend/` Directory)
*   **`backend/src/controllers/`**: Lapisan yang bertugas menerima *request* dari router, membaca input, memanggil *services*, dan mengembalikan response JSON ke klien.
*   **`backend/src/services/`**: Lapisan inti *business logic*. Menjalankan kueri SQL langsung ke database melalui MySQL2, memvalidasi aturan aplikasi, dan memproses data.
*   **`backend/src/routes/`**: Tempat mendefinisikan *endpoint* URL REST API dan menghubungkannya ke controller yang tepat.
*   **`backend/src/middleware/`**: Fungsi keamanan dan filter yang berjalan di tengah (sebelum controller). Contoh: Autentikasi JWT, pemeriksaan *Role* (Admin/User), rate-limiting.
*   **`backend/src/config/`**: Setup variabel lingkungan (env) dan inisialisasi koneksi kolam (*connection pool*) ke database MySQL.
*   **`backend/src/socket/`**: Logika pengendali interaksi WebSocket (Socket.IO) untuk menyebarkan (broadcasting) event realtime ke aplikasi klien.

---

## 📦 Dependensi Utama & Alasannya

### Frontend
*   **Next.js 14 & React 19:** Framework andalan untuk membangun aplikasi modern dengan kemampuan rendering efisien dan rute berbasis file.
*   **Tailwind CSS:** Dipilih untuk *styling* antarmuka secara *utility-first* karena mempercepat proses desain, membuat UI responsif, dan konsisten tanpa harus membuat file CSS kustom berulang.
*   **Zustand:** Digunakan sebagai *state management* lokal. Jauh lebih ringan, cepat, dan minim *boilerplate* dibandingkan Redux untuk menyimpan session/auth pengguna.
*   **TanStack React Query:** Digunakan untuk *data fetching* asinkron. Memberikan fitur *caching* cerdas, *auto-refetch*, dan sinkronisasi status UI (loading, error) secara instan.
*   **Axios:** Klien HTTP untuk request data. Dipilih karena kemudahan membuat *Interceptors* (sangat berguna untuk menyisipkan Token JWT otomatis ke setiap request).
*   **React Hook Form & Zod:** Kombinasi sempurna untuk menangani form. *React Hook Form* menghemat memori *re-render* UI saat mengetik, sedangkan *Zod* memastikan validasi skema data valid sebelum dikirim ke backend.
*   **Socket.IO-Client:** Mendukung penerimaan sinyal realtime secara *event-driven* tanpa klien harus me-request berulang kali (long-polling) ke server.
*   **Recharts:** Library penyusun grafik yang dipakai di halaman monitoring admin untuk visualisasi data secara interaktif.

### Backend
*   **Express.js:** Framework minimalis, cepat, dan ekosistem middleware yang kaya, memudahkan strukturisasi API Node.js.
*   **MySQL2:** Driver database relasional. Dipilih karena mendukung *Prepared Statements* (mengamankan dari SQL Injection) dan sistem *Pooling* (mengelola ribuan koneksi DB secara simultan).
*   **Socket.IO:** Mengelola koneksi *WebSocket* server untuk fitur *live update* notifikasi peminjaman ke seluruh browser klien yang terhubung.
*   **JsonWebToken (JWT) & Bcryptjs:** *Bcryptjs* men-enkripsi kata sandi secara ireversibel untuk keamanan DB. *JWT* digunakan untuk *stateless authentication*, di mana identitas diverifikasi oleh server hanya melalui token.
*   **Multer:** Middleware khusus NodeJS yang menangani data berformat `multipart/form-data` (dipakai untuk mengelola upload file/gambar bukti ruangan).
*   **PDFKit:** Library murni untuk mem-build dokumen laporan PDF (report peminjaman) dinamis secara programatis (on-the-fly) lalu disajikan untuk di-download.

---

## ⚙️ Setup & Instalasi

```bash
# 1. Install dependensi
npm install
cd backend && npm install
cd ..

# 2. Setup Environment
cp .env.local .env.local   # Konfigurasi port klien
cd backend && cp .env.example .env # Konfigurasi kredensial DB server

# 3. Jalankan DB & Frontend + Backend Serentak (di terminal terpisah)
# Terminal 1: Backend
cd backend && npm run dev
# Terminal 2: Frontend
npm run dev
```

## ✅ Rangkuman Fitur
- Auth JWT + Zustand persist + axios interceptor (401 → redirect)
- Protected routes dengan role guard
- Dashboard dengan statistik, Room grid + filter
- Form booking + conflict check realtime
- Admin: tabel approval + modal approve/reject
- Admin: CRUD ruangan (tambah/edit/hapus)
- Admin: monitoring charts (bar + pie) & Export PDF Report
- Socket.IO realtime update + toast notification
- Skeleton loading states & Responsive layout mobile
- TypeScript strict
