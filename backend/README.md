# 🏫 Pinjam Ruang — Backend API

Backend Express.js + TypeScript untuk sistem peminjaman ruangan smart campus.

## 📁 Struktur Folder

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts              # Validasi env dengan Zod
│   │   └── db.ts               # MySQL Connection Pool
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── roomController.ts
│   │   └── bookingController.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts   # JWT verify
│   │   ├── roleMiddleware.ts   # RBAC
│   │   ├── validateMiddleware.ts # Zod validation
│   │   └── errorMiddleware.ts  # Global error handler
│   ├── routes/
│   │   ├── index.ts
│   │   ├── authRoutes.ts
│   │   ├── roomRoutes.ts
│   │   └── bookingRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── roomService.ts
│   │   └── bookingService.ts
│   ├── socket/
│   │   └── socketHandler.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── response.ts
│   │   ├── jwt.ts
│   │   └── dateHelper.ts
│   └── app.ts
├── schema.sql                  # SQL schema untuk MySQL
├── .env                        # Environment variables
├── package.json
└── tsconfig.json
```

## ⚡ Setup

### 1. Buat Database MySQL

Buka MySQL (misal menggunakan XAMPP/phpMyAdmin) dan jalankan isi dari file `schema.sql`. File ini akan membuat database `pinjam_ruang` beserta semua tabelnya.

### 2. Isi file `.env`

```env
PORT=5000
NODE_ENV=development

# Konfigurasi Database MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pinjam_ruang
DB_PORT=3306

# Konfigurasi JWT
JWT_SECRET=rahasia_super_aman_minimal_32_karakter_ya_jangan_lupa
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 3. Jalankan Backend

```bash
cd backend
npm install
npm run dev
```

Server berjalan di: `http://localhost:5000`

---

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

---

### 🔐 Auth (`/api/auth`)

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Budi Santoso",
  "email": "budi@kampus.ac.id",
  "password": "password123",
  "role": "mahasiswa",
  "faculty": "Teknik Informatika"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "token": "eyJ...",
    "user": { "id": "uuid", "name": "Budi Santoso", "role": "mahasiswa" }
  },
  "error": null
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "budi@kampus.ac.id",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

### 🏛️ Rooms (`/api/rooms`)

#### List Rooms (Public)
```http
GET /api/rooms?building=Gedung A&status=available&search=lab
```

#### Get Room Detail + Jadwal Hari Ini (Public)
```http
GET /api/rooms/:id
```

#### Create Room (Admin only)
```http
POST /api/rooms
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Lab Komputer 2",
  "building": "Gedung B",
  "capacity": 40,
  "facility": ["komputer", "AC", "proyektor"],
  "status": "available"
}
```

#### Update Room (Admin only)
```http
PUT /api/rooms/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "status": "maintenance" }
```

#### Delete Room (Admin only)
```http
DELETE /api/rooms/:id
Authorization: Bearer <admin_token>
```

---

### 📅 Bookings (`/api/bookings`)

#### List Bookings (Auth required)
```http
GET /api/bookings?status=pending&date=2025-06-01
Authorization: Bearer <token>
```
> Admin → semua booking. User biasa → hanya miliknya.

#### Check Conflict (Public)
```http
GET /api/bookings/check-conflict?room_id=uuid&date=2025-06-01&start_time=09:00&end_time=11:00
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isConflict": false,
    "conflictingBookings": []
  }
}
```

#### Create Booking (Mahasiswa/Dosen/Organisasi)
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "room_id": "uuid-ruangan",
  "date": "2025-06-15",
  "start_time": "09:00",
  "end_time": "11:00",
  "purpose": "Rapat BEM Fakultas"
}
```

#### Approve/Reject Booking (Admin only)
```http
PUT /api/bookings/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "status": "approved" }
```

#### Delete Booking (Owner / Admin)
```http
DELETE /api/bookings/:id
Authorization: Bearer <token>
```
> Hanya booking dengan status `pending` yang bisa dihapus.

---

## ⚡ Socket.IO Events

### Client → Server

| Event | Data | Keterangan |
|-------|------|------------|
| `ping` | — | Health check |
| `admin:room_status_change` | `{ room_id, status }` | Admin ubah status room |

### Server → Client

| Event | Dikirim ke | Keterangan |
|-------|-----------|------------|
| `new_booking` | `admin_room` | Ada booking baru masuk |
| `booking_status_updated` | `user_<userId>` | Status booking diubah admin |
| `room_status_changed` | All clients | Status ruangan berubah |
| `pong` | Sender | Response ping |

### Koneksi Socket dengan Auth:
```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'Bearer_token_disini' }
});
```

---

## 🔒 Roles & Permissions

| Endpoint | mahasiswa | dosen | organisasi | admin |
|---------|-----------|-------|------------|-------|
| GET /rooms | ✅ | ✅ | ✅ | ✅ |
| POST /rooms | ❌ | ❌ | ❌ | ✅ |
| POST /bookings | ✅ | ✅ | ✅ | ✅ |
| PUT /bookings/:id | ❌ | ❌ | ❌ | ✅ |
| GET /bookings (semua) | ❌ | ❌ | ❌ | ✅ |

---

## 📦 Format Response

```json
{
  "success": true,
  "message": "Pesan deskriptif",
  "data": { },
  "error": null
}
```

Error response:
```json
{
  "success": false,
  "message": "Pesan error",
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "details": { }
  }
}
```

### Kode Error Umum

| Code | HTTP | Keterangan |
|------|------|------------|
| `NO_TOKEN` | 401 | Header Authorization tidak ada |
| `TOKEN_EXPIRED` | 401 | Token kadaluarsa |
| `INVALID_TOKEN` | 401 | Token tidak valid |
| `FORBIDDEN` | 403 | Role tidak diizinkan |
| `VALIDATION_ERROR` | 400 | Input gagal validasi Zod |
| `EMAIL_EXISTS` | 409 | Email sudah terdaftar |
| `ROOM_NOT_FOUND` | 404 | Ruangan tidak ditemukan |
| `TIME_CONFLICT` | 409 | Jadwal bentrok |
| `ROOM_MAINTENANCE` | 400 | Ruangan sedang maintenance |
| `DATE_IN_PAST` | 400 | Tanggal booking sudah lewat |
