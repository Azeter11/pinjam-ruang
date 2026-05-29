-- ============================================================
-- PINJAM RUANG — MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS pinjam_ruang;
USE pinjam_ruang;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('mahasiswa', 'dosen', 'organisasi', 'admin') NOT NULL DEFAULT 'mahasiswa',
  faculty VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ROOMS
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  building VARCHAR(255) NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  facility JSON,
  image VARCHAR(255),
  status ENUM('available', 'occupied', 'maintenance') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  room_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- BOOKING_LOGS
CREATE TABLE IF NOT EXISTS booking_logs (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_bookings_room_date ON bookings(room_id, date);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_building ON rooms(building);

-- ============================================================
-- SEED DATA (Opsional — untuk testing)
-- ============================================================

INSERT IGNORE INTO rooms (id, name, building, capacity, facility, status) VALUES
  (UUID(), 'Aula Utama', 'Gedung A', 200, '["proyektor", "AC", "sound system", "mic"]', 'available'),
  (UUID(), 'Lab Komputer 1', 'Gedung B', 40, '["komputer", "AC", "proyektor", "internet"]', 'available'),
  (UUID(), 'Ruang Rapat 101', 'Gedung C', 20, '["AC", "proyektor", "whiteboard"]', 'available'),
  (UUID(), 'Ruang Seminar', 'Gedung A', 100, '["proyektor", "AC", "mic", "sound system"]', 'available'),
  (UUID(), 'Lab Jaringan', 'Gedung B', 30, '["komputer", "AC", "router", "internet"]', 'maintenance');
