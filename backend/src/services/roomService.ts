import { db } from '../config/db';
import { Room, RoomFilters, PaginatedResponse } from '../types';
import { RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

// ─── GET ALL ROOMS ───────────────────────────────────────────────────────────
export async function getRooms(filters: RoomFilters): Promise<PaginatedResponse<Room>> {
  let baseQuery = 'FROM rooms WHERE 1=1';
  const params: any[] = [];

  if (filters.building) {
    baseQuery += ' AND building = ?';
    params.push(filters.building);
  }
  if (filters.status) {
    baseQuery += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.search) {
    baseQuery += ' AND (name LIKE ? OR building LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
  const [countRows] = await db.execute<RowDataPacket[]>(countQuery, params);
  const total = countRows[0]?.total ?? 0;

  // Add ordering and pagination
  let query = `SELECT * ${baseQuery} ORDER BY created_at DESC`;
  
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || (total > 0 ? total : 10);
  const offset = (page - 1) * limit;

  if (filters.page !== undefined || filters.limit !== undefined) {
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
  }

  const [rows] = await db.execute<RowDataPacket[]>(query, params);
  
  const data = rows.map(row => ({
    ...row,
    facility: typeof row.facility === 'string' ? JSON.parse(row.facility) : (row.facility || [])
  })) as Room[];

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    total,
    page,
    limit,
    totalPages
  };
}

// ─── GET ROOM BY ID ──────────────────────────────────────────────────────────
export async function getRoomById(id: string): Promise<Room & { todayBookings: unknown[] }> {
  const [rooms] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM rooms WHERE id = ?',
    [id]
  );

  if (rooms.length === 0) {
    const err = new Error('Ruangan tidak ditemukan') as Error & { statusCode: number; code: string };
    err.statusCode = 404;
    err.code = 'ROOM_NOT_FOUND';
    throw err;
  }

  const room = rooms[0];
  room.facility = typeof room.facility === 'string' ? JSON.parse(room.facility) : (room.facility || []);

  // Get today's bookings for the room (exclude completed)
  const today = new Date().toISOString().split('T')[0];
  const [bookings] = await db.execute<RowDataPacket[]>(`
    SELECT b.*, u.name as user_name, u.email as user_email, u.role as user_role 
    FROM bookings b 
    JOIN users u ON b.user_id = u.id 
    WHERE b.room_id = ? AND b.date = ? AND b.status IN ('approved', 'pending') 
    ORDER BY b.start_time ASC
  `, [id, today]);

  const todayBookings = bookings.map(b => {
    const { user_name, user_email, user_role, ...bookingData } = b;
    return {
      ...bookingData,
      user: { name: user_name, email: user_email, role: user_role }
    };
  });

  return { ...(room as Room), todayBookings };
}

// ─── GET ROOM SCHEDULE ───────────────────────────────────────────────────────
export async function getRoomSchedule(roomId: string, startDate?: string, endDate?: string): Promise<{
  room: Room;
  schedule: Array<{
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    purpose: string;
    user: {
      name: string;
      email: string;
      role: string;
      faculty?: string;
    };
  }>;
}> {
  // Check if room exists
  const [rooms] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM rooms WHERE id = ?',
    [roomId]
  );

  if (rooms.length === 0) {
    const err = new Error('Ruangan tidak ditemukan') as Error & { statusCode: number; code: string };
    err.statusCode = 404;
    err.code = 'ROOM_NOT_FOUND';
    throw err;
  }

  const room = rooms[0];
  room.facility = typeof room.facility === 'string' ? JSON.parse(room.facility) : (room.facility || []);

  // Build query for approved bookings only (exclude completed)
  let query = `
    SELECT 
      b.id, b.date, b.start_time, b.end_time, b.purpose,
      u.name as user_name, u.email as user_email, u.role as user_role, u.faculty as user_faculty
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    WHERE b.room_id = ? AND b.status = 'approved'
  `;
  const params: any[] = [roomId];

  // Add date filters if provided
  if (startDate) {
    query += ' AND b.date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND b.date <= ?';
    params.push(endDate);
  }

  // Default: show future bookings only (from today onwards)
  if (!startDate && !endDate) {
    const today = new Date().toISOString().split('T')[0];
    query += ' AND b.date >= ?';
    params.push(today);
  }

  query += ' ORDER BY b.date ASC, b.start_time ASC';

  const [bookings] = await db.execute<RowDataPacket[]>(query, params);

  const schedule = bookings.map(b => {
    // Convert date to string if it's a Date object
    let dateStr = b.date;
    if (b.date instanceof Date) {
      dateStr = b.date.toISOString().split('T')[0];
    }

    return {
      id: b.id,
      date: dateStr,
      start_time: b.start_time,
      end_time: b.end_time,
      purpose: b.purpose,
      user: {
        name: b.user_name,
        email: b.user_email,
        role: b.user_role,
        faculty: b.user_faculty
      }
    };
  });

  return {
    room: room as Room,
    schedule
  };
}

// ─── CREATE ROOM ─────────────────────────────────────────────────────────────
export async function createRoom(input: Omit<Room, 'id' | 'created_at'>): Promise<Room> {
  const id = uuidv4();
  const facilityJson = JSON.stringify(input.facility || []);
  
  await db.execute(
    'INSERT INTO rooms (id, name, building, capacity, facility, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, input.name, input.building, input.capacity, facilityJson, input.image || null, input.status]
  );

  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM rooms WHERE id = ?', [id]);
  const room = rows[0];
  room.facility = typeof room.facility === 'string' ? JSON.parse(room.facility) : (room.facility || []);
  
  return room as Room;
}

// ─── UPDATE ROOM ─────────────────────────────────────────────────────────────
export async function updateRoom(
  id: string,
  input: Partial<Omit<Room, 'id' | 'created_at'>>
): Promise<Room> {
  // Check exists
  await getRoomById(id);

  const updates: string[] = [];
  const params: any[] = [];

  if (input.name !== undefined) { updates.push('name = ?'); params.push(input.name); }
  if (input.building !== undefined) { updates.push('building = ?'); params.push(input.building); }
  if (input.capacity !== undefined) { updates.push('capacity = ?'); params.push(input.capacity); }
  if (input.facility !== undefined) { updates.push('facility = ?'); params.push(JSON.stringify(input.facility)); }
  if (input.image !== undefined) { updates.push('image = ?'); params.push(input.image); }
  if (input.status !== undefined) { updates.push('status = ?'); params.push(input.status); }

  if (updates.length > 0) {
    params.push(id);
    await db.execute(
      `UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM rooms WHERE id = ?', [id]);
  const room = rows[0];
  room.facility = typeof room.facility === 'string' ? JSON.parse(room.facility) : (room.facility || []);
  
  return room as Room;
}

// ─── DELETE ROOM ─────────────────────────────────────────────────────────────
export async function deleteRoom(id: string): Promise<void> {
  // Check exists
  await getRoomById(id);

  // Check for active bookings
  const [activeBookings] = await db.execute<RowDataPacket[]>(
    `SELECT id FROM bookings WHERE room_id = ? AND status IN ('pending', 'approved') LIMIT 1`,
    [id]
  );

  if (activeBookings.length > 0) {
    const err = new Error(
      'Tidak dapat menghapus ruangan yang memiliki booking aktif'
    ) as Error & { statusCode: number; code: string };
    err.statusCode = 409;
    err.code = 'ROOM_HAS_ACTIVE_BOOKINGS';
    throw err;
  }

  await db.execute('DELETE FROM rooms WHERE id = ?', [id]);
}
