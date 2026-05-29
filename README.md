# 🏛️ Pinjam Ruang — Smart Campus Room Booking System

Frontend aplikasi peminjaman ruangan kampus berbasis **Next.js 14 (App Router)** dengan fitur realtime, auth, dan panel admin.

---

## 🚀 Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| State (global) | Zustand + persist middleware |
| Data fetching | TanStack React Query v5 |
| HTTP client | Axios + interceptors |
| Forms + Validation | React Hook Form + Zod |
| Realtime | Socket.IO Client |
| Charts | Recharts |
| Icons | Lucide React |

---

## ⚙️ Setup

```bash
npm install
cp .env.local .env.local   # edit API URL
npm run dev
```

## 🔧 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 🔐 Roles

| Role | Halaman |
|---|---|
| mahasiswa / dosen / organisasi | Dashboard, Rooms, My Bookings |
| admin | Admin Approval, Admin Rooms, Monitoring |

## 📡 API Endpoints

```
POST /api/auth/login | register | logout
GET  /api/auth/me

GET/POST   /api/rooms
GET/PUT/DELETE /api/rooms/:id
GET  /api/rooms/:id/schedule

GET  /api/bookings                    (user's bookings)
GET  /api/admin/bookings              (all bookings)
POST /api/bookings
PUT  /api/bookings/:id
GET  /api/bookings/check-conflict
GET  /api/bookings/stats
GET  /api/admin/stats
```

## ⚡ Socket Events

```
booking_status_updated  → invalidate cache + toast ke user
room_status_changed     → invalidate rooms cache
```

## ✅ Fitur

- Auth JWT + Zustand persist + axios interceptor (401 → redirect)
- Protected routes dengan role guard
- Landing page publik
- Dashboard dengan 4 statistik cards
- Room grid + filter (gedung, status, search)
- Room detail + form booking + conflict check realtime
- Confirmation modal sebelum submit
- My Bookings + filter status + pagination
- Admin: tabel approval + modal approve/reject + catatan
- Admin: CRUD ruangan (tambah/edit/hapus)
- Admin: monitoring charts (bar + pie)
- Socket.IO realtime update + toast notification
- Booking timeline visual
- Room weekly schedule grid
- Skeleton loading states
- Responsive mobile (sidebar collapsible)
- TypeScript strict (zero errors)
