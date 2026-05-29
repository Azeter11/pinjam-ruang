# 📸 Preview Tampilan Jadwal Ruangan

## 🎯 Lokasi Jadwal

```
Halaman: /rooms/[id]
Posisi: Di bawah info ruangan, sebelah kiri form peminjaman
```

---

## 🖼️ Mockup Tampilan

### **Halaman Detail Ruangan - Dengan Jadwal**

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  ← Kembali                                                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                             ║
║  ┌────────────────────────────────────────┐  ┌──────────────────────────┐ ║
║  │                                        │  │  Form Peminjaman         │ ║
║  │  ┌──────────────────────────────────┐ │  │                          │ ║
║  │  │                                  │ │  │  Tanggal:                │ ║
║  │  │         [Foto Ruangan]           │ │  │  [___________]           │ ║
║  │  │                                  │ │  │                          │ ║
║  │  │                                  │ │  │  Waktu Mulai:            │ ║
║  │  └──────────────────────────────────┘ │  │  [___________]           │ ║
║  │                                        │  │                          │ ║
║  │  Lab Komputer 1                        │  │  Waktu Selesai:          │ ║
║  │  📍 Gedung B  👥 40 orang              │  │  [___________]           │ ║
║  │                                        │  │                          │ ║
║  │  Fasilitas:                            │  │  Keperluan:              │ ║
║  │  [komputer] [AC] [proyektor]           │  │  [___________]           │ ║
║  │                                        │  │                          │ ║
║  └────────────────────────────────────────┘  │  [Ajukan Peminjaman]     │ ║
║                                               │                          │ ║
║  ┌────────────────────────────────────────┐  └──────────────────────────┘ ║
║  │  Jadwal Mingguan                       │                              ║
║  │  29 Mei - 4 Jun 2026  [←] [→]         │  ⬅️ JADWAL DITAMPILKAN DI   ║
║  │                                        │     SINI!                    ║
║  │     Sen  Sel  Rab  Kam  Jum  Sab  Min │                              ║
║  │      30   31   1    2    3    4    5  │                              ║
║  │                                        │                              ║
║  │ 07:00 │   │   │   │   │   │   │   │  │                              ║
║  │ 08:00 │   │ ▓ │   │   │ ▓ │   │   │  │  ▓ = Booking Approved       ║
║  │ 09:00 │   │ ▓ │   │   │ ▓ │   │   │  │      (Waktu Terisi)         ║
║  │ 10:00 │   │   │ ▓ │   │   │   │   │  │                              ║
║  │ 11:00 │   │   │ ▓ │   │   │   │   │  │  Kosong = Waktu Tersedia    ║
║  │ 12:00 │   │   │   │   │   │   │   │  │                              ║
║  │ 13:00 │ ▓ │   │   │ ▓ │   │   │   │  │                              ║
║  │ 14:00 │ ▓ │   │   │ ▓ │   │   │   │  │                              ║
║  │ 15:00 │   │   │   │   │   │   │   │  │                              ║
║  │ 16:00 │   │   │   │   │   │   │   │  │                              ║
║  │ 17:00 │   │   │   │   │   │   │   │  │                              ║
║  │ 18:00 │   │   │   │   │   │   │   │  │                              ║
║  │ 19:00 │   │   │   │   │   │   │   │  │                              ║
║  │ 20:00 │   │   │   │   │   │   │   │  │                              ║
║  │ 21:00 │   │   │   │   │   │   │   │  │                              ║
║  │                                        │                              ║
║  └────────────────────────────────────────┘                              ║
║                                                                             ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🎨 Detail Visual Jadwal

### **1. Header Jadwal**
```
┌─────────────────────────────────────────────────┐
│ Jadwal Mingguan                                 │
│ 29 Mei - 4 Jun 2026        [←]  [→]            │
└─────────────────────────────────────────────────┘
```

### **2. Grid Hari**
```
┌────┬────┬────┬────┬────┬────┬────┐
│Sen │Sel │Rab │Kam │Jum │Sab │Min │
│ 30 │ 31 │ 1  │ 2  │ 3  │ 4  │ 5  │  ← Tanggal
└────┴────┴────┴────┴────┴────┴────┘
```

### **3. Grid Waktu dengan Booking**
```
        Sen  Sel  Rab  Kam  Jum  Sab  Min
08:00   │   │ ▓ │   │   │ ▓ │   │   │
        │   │ ▓ │   │   │ ▓ │   │   │
09:00   │   │ ▓ │   │   │ ▓ │   │   │
        │   │   │   │   │   │   │   │
10:00   │   │   │ ▓ │   │   │   │   │
        │   │   │ ▓ │   │   │   │   │
11:00   │   │   │ ▓ │   │   │   │   │
```

**Keterangan:**
- `▓` (Hijau) = Booking Approved - Waktu Terisi
- `▓` (Kuning) = Booking Pending - Menunggu Approval
- Kosong = Waktu Tersedia untuk Dipinjam

---

## 🖱️ Interaksi User

### **1. Hover pada Booking**
```
┌─────────────────────────────┐
│ Senin, 08:00 - 10:00        │
│                             │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│                             │
│ 📌 Praktikum Jaringan       │  ← Tooltip muncul saat hover
│ 👤 Dr. John Doe             │
│ ⏰ 08:00 - 10:00            │
└─────────────────────────────┘
```

### **2. Navigasi Minggu**
```
[← Minggu Lalu]  29 Mei - 4 Jun 2026  [Minggu Depan →]
       ↑                                      ↑
   Klik untuk                            Klik untuk
   minggu lalu                          minggu depan
```

### **3. Hari Ini (Highlighted)**
```
┌────┬────┬────┬────┬────┬────┬────┐
│Sen │Sel │Rab │Kam │Jum │Sab │Min │
│ 30 │ 31 │ 1  │ 2  │ 3  │ 4  │ 5  │
└────┴────┴────┴────┴────┴────┴────┘
        ↑
    Hari ini (background biru)
```

---

## 📱 Responsive Design

### **Desktop (> 1024px)**
```
┌─────────────────────────────────────────────────────┐
│  Info Ruangan (60%)    │    Form Peminjaman (40%)   │
│                        │                            │
│  Jadwal Mingguan       │                            │
│  (Full Width)          │                            │
└─────────────────────────────────────────────────────┘
```

### **Tablet (768px - 1024px)**
```
┌─────────────────────────────────────────────────────┐
│  Info Ruangan (Full Width)                          │
│                                                     │
│  Jadwal Mingguan (Full Width, Scroll Horizontal)   │
│                                                     │
│  Form Peminjaman (Full Width)                      │
└─────────────────────────────────────────────────────┘
```

### **Mobile (< 768px)**
```
┌──────────────────────┐
│  Info Ruangan        │
│  (Full Width)        │
│                      │
│  Jadwal Mingguan     │
│  (Scroll Horizontal) │
│                      │
│  Form Peminjaman     │
│  (Full Width)        │
└──────────────────────┘
```

---

## 🎯 User Flow

### **Skenario: User Ingin Meminjam Ruangan**

```
1. User buka menu "Ruangan"
   ↓
2. User klik "Lihat & Pinjam" pada ruangan yang diinginkan
   ↓
3. User melihat info ruangan (foto, fasilitas, kapasitas)
   ↓
4. User scroll ke bawah, melihat JADWAL MINGGUAN ⭐
   ↓
5. User lihat waktu yang kosong (tidak ada kotak hijau)
   ↓
6. User pilih tanggal dan waktu kosong di form peminjaman
   ↓
7. User isi keperluan
   ↓
8. User klik "Ajukan Peminjaman"
   ↓
9. ✅ Booking berhasil diajukan!
```

---

## 🔍 Contoh Kasus Penggunaan

### **Kasus 1: Ruangan Sibuk (Banyak Booking)**

User melihat jadwal:
```
        Sen  Sel  Rab  Kam  Jum  Sab  Min
08:00   ▓    ▓    ▓    ▓    ▓    -    -
09:00   ▓    ▓    ▓    ▓    ▓    -    -
10:00   ▓    ▓    ▓    ▓    ▓    -    -
11:00   ▓    -    ▓    -    ▓    -    -
13:00   ▓    ▓    ▓    ▓    ▓    -    -
14:00   ▓    ▓    ▓    ▓    ▓    -    -
```

**Insight User:**
- ❌ Senin-Jumat pagi penuh
- ✅ Sabtu-Minggu kosong
- ✅ Selasa & Kamis jam 11:00 kosong

**Action:** User pilih Sabtu atau Minggu untuk booking

---

### **Kasus 2: Ruangan Kosong (Tidak Ada Booking)**

User melihat jadwal:
```
        Sen  Sel  Rab  Kam  Jum  Sab  Min
08:00   -    -    -    -    -    -    -
09:00   -    -    -    -    -    -    -
10:00   -    -    -    -    -    -    -
11:00   -    -    -    -    -    -    -
13:00   -    -    -    -    -    -    -
14:00   -    -    -    -    -    -    -
```

**Insight User:**
- ✅ Semua waktu tersedia
- ✅ Bebas pilih hari dan jam

**Action:** User pilih waktu yang paling sesuai

---

### **Kasus 3: Mencari Waktu Spesifik**

User ingin booking **Rabu jam 10:00-12:00**

Lihat jadwal:
```
        Sen  Sel  Rab  Kam  Jum  Sab  Min
08:00   ▓    ▓    -    ▓    ▓    -    -
09:00   ▓    ▓    -    ▓    ▓    -    -
10:00   ▓    ▓    -    ▓    ▓    -    -  ← Rabu jam 10 KOSONG ✅
11:00   ▓    -    -    -    ▓    -    -  ← Rabu jam 11 KOSONG ✅
12:00   -    -    -    -    -    -    -
13:00   ▓    ▓    ▓    ▓    ▓    -    -
```

**Insight User:**
- ✅ Rabu jam 10:00-12:00 TERSEDIA!

**Action:** User langsung booking dengan percaya diri

---

## ✅ Keuntungan Fitur Ini

### **Untuk User:**
1. ✅ Tahu waktu kosong sebelum booking
2. ✅ Tidak perlu coba-coba
3. ✅ Mengurangi booking yang ditolak
4. ✅ Pengalaman lebih baik

### **Untuk Admin:**
1. ✅ Mengurangi booking yang bentrok
2. ✅ User lebih informed
3. ✅ Lebih sedikit komplain
4. ✅ Proses approval lebih smooth

### **Untuk Sistem:**
1. ✅ Mengurangi konflik booking
2. ✅ Data lebih terorganisir
3. ✅ User experience lebih baik
4. ✅ Efisiensi operasional meningkat

---

## 🚀 Cara Melihat Hasil

1. **Restart Frontend**
   ```bash
   npm run dev
   ```

2. **Buka Browser**
   ```
   http://localhost:3000
   ```

3. **Login sebagai User**

4. **Buka Menu Ruangan**
   ```
   Dashboard → Ruangan
   ```

5. **Klik "Lihat & Pinjam"**

6. **Scroll ke Bawah**
   - ✅ Jadwal seharusnya muncul di bawah info ruangan!

---

## 📝 Catatan

- Jadwal menampilkan booking yang **approved** saja
- Booking **completed** tidak ditampilkan
- Booking **pending** bisa ditampilkan dengan warna berbeda (opsional)
- Booking **rejected** tidak ditampilkan
- Jadwal update otomatis setiap minggu

---

## 🎉 Selesai!

Jadwal ruangan sekarang **sudah ditampilkan** dengan sempurna di halaman detail ruangan!

User sekarang bisa melihat waktu kosong dan memilih waktu yang tepat untuk booking. 🎊
