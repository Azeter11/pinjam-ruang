-- ============================================================
-- Migration: Add Completed Status to Bookings
-- Date: 2026-05-29
-- Description: Menambahkan status 'completed' untuk booking yang sudah lewat waktunya
-- ============================================================

-- Note: Status 'completed' sudah ada di schema.sql
-- File ini hanya untuk dokumentasi jika perlu update database yang sudah ada

-- Jika tabel bookings sudah ada tanpa status 'completed', jalankan:
-- ALTER TABLE bookings 
-- MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending';

-- ============================================================
-- Manual Update untuk Booking yang Sudah Lewat
-- ============================================================

-- Update semua booking yang sudah lewat waktunya menjadi 'completed'
UPDATE bookings 
SET status = 'completed' 
WHERE status = 'approved' 
AND (
  date < CURDATE() 
  OR (date = CURDATE() AND end_time < CURTIME())
);

-- ============================================================
-- Verifikasi
-- ============================================================

-- Cek jumlah booking per status
SELECT status, COUNT(*) as total 
FROM bookings 
GROUP BY status;

-- Cek booking yang akan ditampilkan di jadwal (approved dan belum lewat)
SELECT 
  r.name as room_name,
  b.date,
  b.start_time,
  b.end_time,
  b.purpose,
  u.name as user_name,
  b.status
FROM bookings b
JOIN rooms r ON b.room_id = r.id
JOIN users u ON b.user_id = u.id
WHERE b.status = 'approved'
AND b.date >= CURDATE()
ORDER BY b.date ASC, b.start_time ASC;
