-- ============================================================
-- UPDATE DATABASE - Menambahkan Status Completed
-- ============================================================
-- Jalankan script ini jika database Anda sudah ada sebelumnya
-- dan belum memiliki status 'completed'
-- ============================================================

USE pinjam_ruang2;

-- 1. CEK STATUS SAAT INI
-- Jalankan query ini untuk melihat status yang tersedia
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pinjam_ruang2' 
  AND TABLE_NAME = 'bookings' 
  AND COLUMN_NAME = 'status';

-- Jika hasilnya: enum('pending','approved','rejected')
-- Maka perlu update ke: enum('pending','approved','rejected','completed')

-- ============================================================
-- 2. UPDATE ENUM STATUS (Jika Belum Ada 'completed')
-- ============================================================

-- CARA 1: Menggunakan ALTER TABLE (Recommended)
ALTER TABLE bookings 
MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'completed') 
NOT NULL DEFAULT 'pending';

-- ============================================================
-- 3. UPDATE BOOKING YANG SUDAH LEWAT MENJADI COMPLETED
-- ============================================================

-- Update semua booking yang sudah lewat waktunya
UPDATE bookings 
SET status = 'completed' 
WHERE status = 'approved' 
AND (
  date < CURDATE() 
  OR (date = CURDATE() AND end_time < CURTIME())
);

-- ============================================================
-- 4. VERIFIKASI HASIL
-- ============================================================

-- Cek jumlah booking per status
SELECT 
  status, 
  COUNT(*) as total,
  CONCAT(ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM bookings), 1), '%') as percentage
FROM bookings 
GROUP BY status
ORDER BY 
  FIELD(status, 'pending', 'approved', 'completed', 'rejected');

-- Cek booking yang akan muncul di jadwal (approved dan belum lewat)
SELECT 
  r.name as ruangan,
  b.date as tanggal,
  b.start_time as mulai,
  b.end_time as selesai,
  b.purpose as keperluan,
  u.name as peminjam,
  b.status
FROM bookings b
JOIN rooms r ON b.room_id = r.id
JOIN users u ON b.user_id = u.id
WHERE b.status = 'approved'
AND b.date >= CURDATE()
ORDER BY b.date ASC, b.start_time ASC
LIMIT 10;

-- Cek booking yang sudah completed
SELECT 
  r.name as ruangan,
  b.date as tanggal,
  b.start_time as mulai,
  b.end_time as selesai,
  b.status,
  CASE 
    WHEN b.date < CURDATE() THEN 'Tanggal sudah lewat'
    WHEN b.date = CURDATE() AND b.end_time < CURTIME() THEN 'Waktu sudah lewat hari ini'
    ELSE 'Masih akan datang'
  END as alasan
FROM bookings b
JOIN rooms r ON b.room_id = r.id
WHERE b.status = 'completed'
ORDER BY b.date DESC
LIMIT 10;

-- ============================================================
-- 5. TEST DATA (Optional - Untuk Testing)
-- ============================================================

-- Buat booking untuk testing (uncomment jika perlu)
/*
-- Booking kemarin (seharusnya auto-update ke completed)
INSERT INTO bookings (id, user_id, room_id, date, start_time, end_time, purpose, status)
VALUES (
  UUID(), 
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1), 
  (SELECT id FROM rooms LIMIT 1), 
  DATE_SUB(CURDATE(), INTERVAL 1 DAY), 
  '08:00', 
  '10:00', 
  'Test Booking Kemarin', 
  'approved'
);

-- Booking hari ini yang sudah lewat
INSERT INTO bookings (id, user_id, room_id, date, start_time, end_time, purpose, status)
VALUES (
  UUID(), 
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1), 
  (SELECT id FROM rooms LIMIT 1), 
  CURDATE(), 
  '06:00', 
  '07:00', 
  'Test Booking Pagi Tadi', 
  'approved'
);

-- Booking besok (seharusnya tetap approved)
INSERT INTO bookings (id, user_id, room_id, date, start_time, end_time, purpose, status)
VALUES (
  UUID(), 
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1), 
  (SELECT id FROM rooms LIMIT 1), 
  DATE_ADD(CURDATE(), INTERVAL 1 DAY), 
  '10:00', 
  '12:00', 
  'Test Booking Besok', 
  'approved'
);

-- Booking minggu depan
INSERT INTO bookings (id, user_id, room_id, date, start_time, end_time, purpose, status)
VALUES (
  UUID(), 
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1), 
  (SELECT id FROM rooms LIMIT 1), 
  DATE_ADD(CURDATE(), INTERVAL 7 DAY), 
  '14:00', 
  '16:00', 
  'Test Booking Minggu Depan', 
  'approved'
);
*/

-- ============================================================
-- SELESAI!
-- ============================================================
-- Setelah menjalankan script ini:
-- 1. Status 'completed' sudah tersedia
-- 2. Booking lama yang sudah lewat sudah di-update ke 'completed'
-- 3. Backend akan auto-update booking yang lewat waktu
-- 4. Jadwal ruangan akan menampilkan booking yang 'approved' saja
-- ============================================================
