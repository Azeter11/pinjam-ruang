# Fitur Jadwal Ruangan

## Overview
Fitur ini menampilkan jadwal peminjaman ruangan berdasarkan booking yang sudah di-approve oleh admin. Jadwal akan otomatis diupdate dan booking yang sudah lewat waktunya akan berubah status menjadi `completed`.

## Perubahan Database

### Status Booking
Tabel `bookings` sudah mendukung status `completed`:
```sql
status ENUM('pending', 'approved', 'rejected', 'completed')
```

**Status Flow:**
- `pending` → Booking baru dibuat, menunggu approval admin
- `approved` → Booking disetujui admin, akan ditampilkan di jadwal
- `rejected` → Booking ditolak admin
- `completed` → Booking yang sudah lewat waktunya (auto-update)

### Auto-Update Mechanism
Sistem akan otomatis mengubah status booking dari `approved` ke `completed` jika:
- Tanggal booking sudah lewat, ATAU
- Tanggal booking hari ini tapi waktu `end_time` sudah lewat

Query yang digunakan:
```sql
UPDATE bookings 
SET status = 'completed' 
WHERE status = 'approved' 
AND (date < CURDATE() OR (date = CURDATE() AND end_time < CURTIME()))
```

## API Endpoints

### 1. Get Room Schedule
Mendapatkan jadwal peminjaman untuk ruangan tertentu.

**Endpoint:** `GET /api/rooms/:id/schedule`

**Query Parameters:**
- `startDate` (optional): Filter dari tanggal tertentu (format: YYYY-MM-DD)
- `endDate` (optional): Filter sampai tanggal tertentu (format: YYYY-MM-DD)
- Jika tidak ada parameter, default menampilkan jadwal dari hari ini ke depan

**Response:**
```json
{
  "success": true,
  "message": "Jadwal ruangan berhasil diambil",
  "data": {
    "room": {
      "id": "uuid",
      "name": "Lab Komputer 1",
      "building": "Gedung B",
      "capacity": 40,
      "facility": ["komputer", "AC", "proyektor"],
      "image": "url",
      "status": "available"
    },
    "schedule": [
      {
        "id": "booking-uuid",
        "date": "2026-05-30",
        "start_time": "08:00",
        "end_time": "10:00",
        "purpose": "Praktikum Jaringan Komputer",
        "user": {
          "name": "John Doe",
          "email": "john@example.com",
          "role": "dosen",
          "faculty": "Teknik Informatika"
        }
      },
      {
        "id": "booking-uuid-2",
        "date": "2026-05-30",
        "start_time": "13:00",
        "end_time": "15:00",
        "purpose": "Rapat Organisasi",
        "user": {
          "name": "Jane Smith",
          "email": "jane@example.com",
          "role": "organisasi",
          "faculty": "BEM"
        }
      }
    ]
  }
}
```

**Contoh Penggunaan:**

1. Jadwal dari hari ini ke depan (default):
```bash
GET /api/rooms/abc-123/schedule
```

2. Jadwal untuk rentang tanggal tertentu:
```bash
GET /api/rooms/abc-123/schedule?startDate=2026-06-01&endDate=2026-06-30
```

3. Jadwal dari tanggal tertentu ke depan:
```bash
GET /api/rooms/abc-123/schedule?startDate=2026-06-01
```

## Logika Bisnis

### 1. Auto-Update Completed Bookings
Fungsi `autoUpdateCompletedBookings()` dipanggil setiap kali:
- User mengakses daftar bookings (`GET /api/bookings`)
- Memastikan data yang ditampilkan selalu up-to-date

### 2. Filter Jadwal
Jadwal yang ditampilkan:
- ✅ Hanya booking dengan status `approved`
- ✅ Tidak menampilkan booking yang `completed`
- ✅ Tidak menampilkan booking yang `pending` atau `rejected`
- ✅ Diurutkan berdasarkan tanggal dan waktu mulai (ascending)

### 3. Informasi yang Ditampilkan
Setiap jadwal menampilkan:
- Tanggal dan waktu (start - end)
- Tujuan/keperluan peminjaman
- Informasi peminjam (nama, email, role, fakultas)

## Implementasi di Frontend

### Contoh Fetch Schedule
```typescript
async function fetchRoomSchedule(roomId: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await fetch(
    `${API_URL}/rooms/${roomId}/schedule?${params.toString()}`
  );
  const data = await response.json();
  return data;
}
```

### Contoh Tampilan Jadwal
```tsx
// Komponen untuk menampilkan jadwal ruangan
function RoomSchedule({ roomId }: { roomId: string }) {
  const [schedule, setSchedule] = useState(null);
  
  useEffect(() => {
    fetchRoomSchedule(roomId).then(data => {
      setSchedule(data.data);
    });
  }, [roomId]);
  
  if (!schedule) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Jadwal {schedule.room.name}</h2>
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Waktu</th>
            <th>Keperluan</th>
            <th>Peminjam</th>
          </tr>
        </thead>
        <tbody>
          {schedule.schedule.map(item => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{item.start_time} - {item.end_time}</td>
              <td>{item.purpose}</td>
              <td>{item.user.name} ({item.user.role})</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Testing

### Test Auto-Update
```bash
# Buat booking dengan tanggal kemarin
INSERT INTO bookings (id, user_id, room_id, date, start_time, end_time, purpose, status)
VALUES (UUID(), 'user-id', 'room-id', '2026-05-28', '08:00', '10:00', 'Test', 'approved');

# Panggil endpoint bookings untuk trigger auto-update
GET /api/bookings

# Cek status booking (seharusnya berubah jadi 'completed')
SELECT * FROM bookings WHERE date = '2026-05-28';
```

### Test Schedule Endpoint
```bash
# Test get schedule
curl http://localhost:5000/api/rooms/{room-id}/schedule

# Test dengan date range
curl "http://localhost:5000/api/rooms/{room-id}/schedule?startDate=2026-06-01&endDate=2026-06-30"
```

## Keuntungan Implementasi Ini

1. **Tidak Perlu Tabel Baru**: Menggunakan tabel `bookings` yang sudah ada
2. **Auto-Update**: Status otomatis berubah tanpa perlu cron job manual
3. **Efisien**: Query langsung filter status `approved` saja
4. **Fleksibel**: Bisa filter berdasarkan rentang tanggal
5. **Real-time**: Data selalu up-to-date karena auto-update dipanggil saat fetch

## Notes

- Booking yang `completed` tidak akan muncul di jadwal
- Booking yang `pending` atau `rejected` juga tidak muncul di jadwal
- Hanya booking yang `approved` dan belum lewat waktu yang ditampilkan
- Auto-update berjalan setiap kali ada request ke endpoint bookings
