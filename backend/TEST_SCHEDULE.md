# Testing Guide - Fitur Jadwal Ruangan

## Prerequisites
1. Backend server sudah running
2. Database sudah terisi dengan data rooms dan users
3. Ada beberapa booking dengan status 'approved'

## Test 1: Auto-Update Completed Bookings

### Setup
```sql
-- Buat booking dengan tanggal kemarin (seharusnya auto-update ke completed)
INSERT INTO bookings (id, user_id, room_id, date, start_time, end_time, purpose, status)
VALUES (
  UUID(), 
  (SELECT id FROM users LIMIT 1), 
  (SELECT id FROM rooms LIMIT 1), 
  DATE_SUB(CURDATE(), INTERVAL 1 DAY), 
  '08:00', 
  '10:00', 
  'Test Booking Kemarin', 
  'approved'
);

-- Buat booking hari ini tapi sudah lewat (seharusnya auto-update ke completed)
INSERT INTO bookings (id, user_id, room_id, date, start_time, end_time, purpose, status)
VALUES (
  UUID(), 
  (SELECT id FROM users LIMIT 1), 
  (SELECT id FROM rooms LIMIT 1), 
  CURDATE(), 
  '06:00', 
  '07:00', 
  'Test Booking Pagi Tadi', 
  'approved'
);

-- Buat booking hari ini yang masih akan datang (seharusnya tetap approved)
INSERT INTO bookings (id, user_id, room_id, date, start_time, end_time, purpose, status)
VALUES (
  UUID(), 
  (SELECT id FROM users LIMIT 1), 
  (SELECT id FROM rooms LIMIT 1), 
  CURDATE(), 
  '23:00', 
  '23:59', 
  'Test Booking Malam Nanti', 
  'approved'
);
```

### Test
```bash
# Panggil endpoint bookings untuk trigger auto-update
curl http://localhost:5000/api/bookings

# Atau panggil dengan token jika perlu auth
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/bookings
```

### Verifikasi
```sql
-- Cek status booking yang baru dibuat
SELECT 
  purpose,
  date,
  start_time,
  end_time,
  status,
  CASE 
    WHEN date < CURDATE() THEN 'Kemarin (should be completed)'
    WHEN date = CURDATE() AND end_time < CURTIME() THEN 'Hari ini sudah lewat (should be completed)'
    ELSE 'Masih akan datang (should be approved)'
  END as expected_status
FROM bookings
WHERE purpose LIKE 'Test Booking%'
ORDER BY date DESC, start_time DESC;
```

**Expected Result:**
- Booking kemarin: status = `completed`
- Booking pagi tadi: status = `completed`
- Booking malam nanti: status = `approved`

---

## Test 2: Get Room Schedule (Default - From Today)

### Test
```bash
# Ambil ID ruangan terlebih dahulu
curl http://localhost:5000/api/rooms

# Gunakan ID ruangan untuk get schedule
curl http://localhost:5000/api/rooms/{ROOM_ID}/schedule
```

### Expected Result
```json
{
  "success": true,
  "message": "Jadwal ruangan berhasil diambil",
  "data": {
    "room": {
      "id": "room-uuid",
      "name": "Lab Komputer 1",
      "building": "Gedung B",
      "capacity": 40,
      "facility": ["komputer", "AC", "proyektor"],
      "status": "available"
    },
    "schedule": [
      {
        "id": "booking-uuid",
        "date": "2026-05-29",
        "start_time": "23:00",
        "end_time": "23:59",
        "purpose": "Test Booking Malam Nanti",
        "user": {
          "name": "User Name",
          "email": "user@example.com",
          "role": "mahasiswa",
          "faculty": "Teknik Informatika"
        }
      }
    ]
  }
}
```

**Validasi:**
- ✅ Hanya menampilkan booking dengan status `approved`
- ✅ Tidak menampilkan booking yang `completed`
- ✅ Hanya menampilkan booking dari hari ini ke depan
- ✅ Diurutkan berdasarkan tanggal dan waktu

---

## Test 3: Get Room Schedule with Date Range

### Setup
```sql
-- Buat beberapa booking untuk bulan depan
INSERT INTO bookings (id, user_id, room_id, date, start_time, end_time, purpose, status)
VALUES 
  (UUID(), (SELECT id FROM users LIMIT 1), (SELECT id FROM rooms LIMIT 1), '2026-06-05', '08:00', '10:00', 'Praktikum Web', 'approved'),
  (UUID(), (SELECT id FROM users LIMIT 1), (SELECT id FROM rooms LIMIT 1), '2026-06-10', '13:00', '15:00', 'Rapat BEM', 'approved'),
  (UUID(), (SELECT id FROM users LIMIT 1), (SELECT id FROM rooms LIMIT 1), '2026-06-15', '10:00', '12:00', 'Seminar', 'approved');
```

### Test
```bash
# Get schedule untuk bulan Juni 2026
curl "http://localhost:5000/api/rooms/{ROOM_ID}/schedule?startDate=2026-06-01&endDate=2026-06-30"

# Get schedule dari tanggal tertentu ke depan
curl "http://localhost:5000/api/rooms/{ROOM_ID}/schedule?startDate=2026-06-01"

# Get schedule sampai tanggal tertentu
curl "http://localhost:5000/api/rooms/{ROOM_ID}/schedule?endDate=2026-06-15"
```

### Expected Result
- Filter berdasarkan rentang tanggal yang diminta
- Hanya menampilkan booking dengan status `approved`
- Diurutkan berdasarkan tanggal dan waktu

---

## Test 4: Schedule untuk Ruangan yang Berbeda

### Test
```bash
# Get schedule untuk ruangan A
curl http://localhost:5000/api/rooms/{ROOM_A_ID}/schedule

# Get schedule untuk ruangan B
curl http://localhost:5000/api/rooms/{ROOM_B_ID}/schedule
```

### Expected Result
- Ruangan A hanya menampilkan jadwal untuk ruangan A
- Ruangan B hanya menampilkan jadwal untuk ruangan B
- Tidak ada cross-contamination data

---

## Test 5: Error Handling

### Test Room Not Found
```bash
curl http://localhost:5000/api/rooms/invalid-room-id/schedule
```

**Expected Result:**
```json
{
  "success": false,
  "message": "Ruangan tidak ditemukan",
  "error": {
    "code": "ROOM_NOT_FOUND",
    "statusCode": 404
  }
}
```

---

## Test 6: Integration Test - Full Flow

### Scenario
1. User membuat booking baru
2. Admin approve booking
3. Jadwal ruangan diupdate otomatis
4. User melihat jadwal ruangan

### Steps
```bash
# 1. Login sebagai user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Save token dari response

# 2. Buat booking baru
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "room_id": "ROOM_ID",
    "date": "2026-06-20",
    "start_time": "14:00",
    "end_time": "16:00",
    "purpose": "Test Integration"
  }'

# Save booking_id dari response

# 3. Login sebagai admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Save admin token

# 4. Approve booking
curl -X PATCH http://localhost:5000/api/bookings/{BOOKING_ID}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"status": "approved"}'

# 5. Cek jadwal ruangan (public endpoint, no auth needed)
curl http://localhost:5000/api/rooms/{ROOM_ID}/schedule
```

### Expected Result
- Booking yang baru di-approve muncul di jadwal ruangan
- Data user yang membuat booking ditampilkan dengan benar
- Jadwal diurutkan dengan benar

---

## Performance Test

### Test dengan Banyak Data
```sql
-- Buat 100 booking untuk testing
DELIMITER $$
CREATE PROCEDURE create_test_bookings()
BEGIN
  DECLARE i INT DEFAULT 0;
  WHILE i < 100 DO
    INSERT INTO bookings (id, user_id, room_id, date, start_time, end_time, purpose, status)
    VALUES (
      UUID(),
      (SELECT id FROM users ORDER BY RAND() LIMIT 1),
      (SELECT id FROM rooms ORDER BY RAND() LIMIT 1),
      DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 30) DAY),
      '08:00',
      '10:00',
      CONCAT('Test Booking ', i),
      'approved'
    );
    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

CALL create_test_bookings();
```

### Test Response Time
```bash
# Measure response time
time curl http://localhost:5000/api/rooms/{ROOM_ID}/schedule

# Atau dengan Apache Bench
ab -n 100 -c 10 http://localhost:5000/api/rooms/{ROOM_ID}/schedule
```

**Expected:**
- Response time < 500ms untuk 100 bookings
- No memory leaks
- Consistent performance

---

## Cleanup

```sql
-- Hapus test data
DELETE FROM bookings WHERE purpose LIKE 'Test%';

-- Drop procedure jika ada
DROP PROCEDURE IF EXISTS create_test_bookings;
```

---

## Checklist Testing

- [ ] Auto-update completed bookings berjalan dengan benar
- [ ] Schedule hanya menampilkan booking yang approved
- [ ] Schedule tidak menampilkan booking yang completed
- [ ] Filter date range berfungsi dengan benar
- [ ] Setiap ruangan hanya menampilkan jadwalnya sendiri
- [ ] Error handling untuk room not found
- [ ] Integration test full flow berhasil
- [ ] Performance test memenuhi standar
- [ ] Data user ditampilkan dengan benar di schedule
- [ ] Sorting berdasarkan tanggal dan waktu benar
