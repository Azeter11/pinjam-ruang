import { Server as SocketServer } from 'socket.io';
import { db } from '../config/db';
import { Booking, BookingFilters, ConflictCheckParams, PaginatedResponse } from '../types';
import { checkTimeConflict, getConflictingBookings } from '../utils/dateHelper';
import { RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

let io: SocketServer | null = null;

export function setSocketIO(socketIO: SocketServer) {
  io = socketIO;
}

// ─── AUTO UPDATE COMPLETED BOOKINGS ───────────────────────────────────────────
export async function autoUpdateCompletedBookings(): Promise<void> {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format

  // Update bookings yang sudah lewat waktunya dari approved ke completed
  await db.execute(
    `UPDATE bookings 
     SET status = 'completed' 
     WHERE status = 'approved' 
     AND (date < ? OR (date = ? AND end_time < ?))`,
    [currentDate, currentDate, currentTime]
  );
}

// ─── GET BOOKINGS ─────────────────────────────────────────────────────────────
export async function getBookings(
  filters: BookingFilters,
  isAdmin: boolean
): Promise<PaginatedResponse<Booking>> {
  // Auto-update completed bookings before fetching
  await autoUpdateCompletedBookings();

  let baseQuery = `
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN rooms r ON b.room_id = r.id
    WHERE 1=1
  `;
  const params: any[] = [];

  // Non-admin: only their own bookings
  if (!isAdmin && filters.user_id) {
    baseQuery += ' AND b.user_id = ?';
    params.push(filters.user_id);
  }

  if (filters.status) {
    baseQuery += ' AND b.status = ?';
    params.push(filters.status);
  }
  if (filters.date) {
    baseQuery += ' AND b.date = ?';
    params.push(filters.date);
  }
  if (filters.room_id) {
    baseQuery += ' AND b.room_id = ?';
    params.push(filters.room_id);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
  const [countRows] = await db.execute<RowDataPacket[]>(countQuery, params);
  const total = countRows[0]?.total ?? 0;

  // Add ordering and pagination
  let query = `
    SELECT 
      b.*, 
      u.id as user_id_join, u.name as user_name, u.email as user_email, u.role as user_role, u.faculty as user_faculty,
      r.id as room_id_join, r.name as room_name, r.building as room_building, r.capacity as room_capacity
    ${baseQuery}
    ORDER BY b.created_at DESC
  `;

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || (total > 0 ? total : 10);
  const offset = (page - 1) * limit;

  if (filters.page !== undefined || filters.limit !== undefined) {
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
  }

  const [rows] = await db.execute<RowDataPacket[]>(query, params);
  
  const data = rows.map(row => {
    const { 
      user_id_join, user_name, user_email, user_role, user_faculty,
      room_id_join, room_name, room_building, room_capacity,
      ...bookingData 
    } = row;
    
    // Convert date object to string YYYY-MM-DD
    if (bookingData.date instanceof Date) {
      bookingData.date = bookingData.date.toISOString().split('T')[0];
    }
    
    return {
      ...bookingData,
      user: { id: user_id_join, name: user_name, email: user_email, role: user_role, faculty: user_faculty },
      room: { id: room_id_join, name: room_name, building: room_building, capacity: room_capacity }
    };
  }) as unknown as Booking[];

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    total,
    page,
    limit,
    totalPages
  };
}

// ─── CHECK CONFLICT ───────────────────────────────────────────────────────────
export async function checkConflict(params: ConflictCheckParams): Promise<{
  isConflict: boolean;
  conflictingBookings: Booking[];
}> {
  const { room_id, date, start_time, end_time } = params;

  const [existingBookings] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM bookings WHERE room_id = ? AND date = ? AND status = ?',
    [room_id, date, 'approved']
  );

  const bookings = (existingBookings ?? []) as Booking[];
  const conflictingBookings = getConflictingBookings(bookings, start_time, end_time);

  return {
    isConflict: conflictingBookings.length > 0,
    conflictingBookings,
  };
}

// ─── CREATE BOOKING ──────────────────────────────────────────────────────────
export async function createBooking(input: {
  user_id: string;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  purpose: string;
}): Promise<Booking> {
  const { room_id, date, start_time, end_time, user_id, purpose } = input;

  // 1. Check room exists and is available
  const [rooms] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM rooms WHERE id = ?',
    [room_id]
  );

  if (rooms.length === 0) {
    const err = new Error('Ruangan tidak ditemukan') as Error & { statusCode: number; code: string };
    err.statusCode = 404;
    err.code = 'ROOM_NOT_FOUND';
    throw err;
  }

  const room = rooms[0];

  if (room.status === 'maintenance') {
    const err = new Error('Ruangan sedang dalam maintenance') as Error & { statusCode: number; code: string };
    err.statusCode = 400;
    err.code = 'ROOM_MAINTENANCE';
    throw err;
  }

  // 2. Check time conflict
  const [existingBookings] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM bookings WHERE room_id = ? AND date = ? AND status = ?',
    [room_id, date, 'approved']
  );

  const hasConflict = checkTimeConflict(
    (existingBookings ?? []) as Booking[],
    start_time,
    end_time
  );

  if (hasConflict) {
    const err = new Error(
      'Ruangan sudah dipesan pada jam tersebut'
    ) as Error & { statusCode: number; code: string };
    err.statusCode = 409;
    err.code = 'TIME_CONFLICT';
    throw err;
  }

  // 3. Insert booking
  const id = uuidv4();
  await db.execute(
    'INSERT INTO bookings (id, user_id, room_id, date, start_time, end_time, purpose, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, user_id, room_id, date, start_time, end_time, purpose, 'pending']
  );

  // Get the created booking with relations
  const [createdRows] = await db.execute<RowDataPacket[]>(`
    SELECT 
      b.*, 
      u.id as user_id_join, u.name as user_name, u.email as user_email, u.role as user_role,
      r.id as room_id_join, r.name as room_name, r.building as room_building
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN rooms r ON b.room_id = r.id
    WHERE b.id = ?
  `, [id]);

  const row = createdRows[0];
  const { 
    user_id_join, user_name, user_email, user_role,
    room_id_join, room_name, room_building,
    ...bookingData 
  } = row;
  
  if (bookingData.date instanceof Date) {
    bookingData.date = bookingData.date.toISOString().split('T')[0];
  }

  const newBooking = {
    ...bookingData,
    user: { id: user_id_join, name: user_name, email: user_email, role: user_role },
    room: { id: room_id_join, name: room_name, building: room_building }
  };

  // 4. Insert booking log
  await db.execute(
    'INSERT INTO booking_logs (id, booking_id, action, description) VALUES (?, ?, ?, ?)',
    [uuidv4(), id, 'created', `Booking dibuat oleh user ${user_id}`]
  );

  // 5. Emit Socket.IO event to admin room
  if (io) {
    io.to('admin_room').emit('new_booking', {
      booking: newBooking,
      message: `Booking baru untuk ruangan ${room.name}`,
    });
  }

  return newBooking as unknown as Booking;
}

// ─── UPDATE BOOKING STATUS ────────────────────────────────────────────────────
export async function updateBookingStatus(
  bookingId: string,
  status: 'approved' | 'rejected',
  adminId: string
): Promise<Booking> {
  // 1. Get existing booking
  const [existingBookings] = await db.execute<RowDataPacket[]>(
    'SELECT b.*, r.id as room_id_join, r.name as room_name FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.id = ?',
    [bookingId]
  );

  if (existingBookings.length === 0) {
    const err = new Error('Booking tidak ditemukan') as Error & { statusCode: number; code: string };
    err.statusCode = 404;
    err.code = 'BOOKING_NOT_FOUND';
    throw err;
  }

  const existingBooking = existingBookings[0];

  if (existingBooking.status !== 'pending') {
    const err = new Error(
      'Hanya booking dengan status pending yang bisa diupdate'
    ) as Error & { statusCode: number; code: string };
    err.statusCode = 400;
    err.code = 'INVALID_STATUS_TRANSITION';
    throw err;
  }

  // 2. Update booking status
  await db.execute(
    'UPDATE bookings SET status = ? WHERE id = ?',
    [status, bookingId]
  );

  // Get updated booking
  const [updatedRows] = await db.execute<RowDataPacket[]>(`
    SELECT 
      b.*, 
      u.id as user_id_join, u.name as user_name, u.email as user_email, u.role as user_role,
      r.id as room_id_join, r.name as room_name, r.building as room_building
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN rooms r ON b.room_id = r.id
    WHERE b.id = ?
  `, [bookingId]);

  const row = updatedRows[0];
  const { 
    user_id_join, user_name, user_email, user_role,
    room_id_join, room_name, room_building,
    ...bookingData 
  } = row;

  if (bookingData.date instanceof Date) {
    bookingData.date = bookingData.date.toISOString().split('T')[0];
  }

  const updatedBooking = {
    ...bookingData,
    user: { id: user_id_join, name: user_name, email: user_email, role: user_role },
    room: { id: room_id_join, name: room_name, building: room_building }
  };

  // 3. Insert booking log
  await db.execute(
    'INSERT INTO booking_logs (id, booking_id, action, description) VALUES (?, ?, ?, ?)',
    [uuidv4(), bookingId, status, `Booking di-${status} oleh admin ${adminId}`]
  );

  // 4. Emit Socket.IO event to the booking owner
  if (io) {
    io.to(`user_${existingBooking.user_id}`).emit('booking_status_updated', {
      booking: updatedBooking,
      message: `Booking Anda telah ${status === 'approved' ? 'disetujui' : 'ditolak'}`,
    });

    // Notify all clients about room status change if approved
    if (status === 'approved') {
      io.emit('room_status_changed', {
        room_id: existingBooking.room_id,
        date: existingBooking.date,
        message: 'Status ruangan telah berubah',
      });
    }
  }

  return updatedBooking as unknown as Booking;
}

// ─── DELETE BOOKING ───────────────────────────────────────────────────────────
export async function deleteBooking(
  bookingId: string,
  userId: string,
  isAdmin: boolean
): Promise<void> {
  const [bookings] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM bookings WHERE id = ?',
    [bookingId]
  );

  if (bookings.length === 0) {
    const err = new Error('Booking tidak ditemukan') as Error & { statusCode: number; code: string };
    err.statusCode = 404;
    err.code = 'BOOKING_NOT_FOUND';
    throw err;
  }

  const booking = bookings[0];

  // Only owner or admin can delete
  if (!isAdmin && booking.user_id !== userId) {
    const err = new Error('Tidak memiliki izin untuk menghapus booking ini') as Error & { statusCode: number; code: string };
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  // Only pending bookings can be deleted
  if (booking.status !== 'pending') {
    const err = new Error('Hanya booking dengan status pending yang bisa dihapus') as Error & { statusCode: number; code: string };
    err.statusCode = 400;
    err.code = 'CANNOT_DELETE_NON_PENDING';
    throw err;
  }

  await db.execute(
    'INSERT INTO booking_logs (id, booking_id, action, description) VALUES (?, ?, ?, ?)',
    [uuidv4(), bookingId, 'deleted', `Booking dihapus oleh user ${userId}`]
  );

  await db.execute('DELETE FROM bookings WHERE id = ?', [bookingId]);
}

// ─── GET BOOKING BY ID ────────────────────────────────────────────────────────
export async function getBookingById(
  bookingId: string,
  userId: string,
  isAdmin: boolean
): Promise<any> {
  const [bookings] = await db.execute<RowDataPacket[]>(`
    SELECT 
      b.*, 
      u.id as user_id_join, u.name as user_name, u.email as user_email, u.role as user_role, u.faculty as user_faculty,
      r.id as room_id_join, r.name as room_name, r.building as room_building, r.capacity as room_capacity
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN rooms r ON b.room_id = r.id
    WHERE b.id = ?
  `, [bookingId]);

  if (bookings.length === 0) {
    const err = new Error('Booking tidak ditemukan') as Error & { statusCode: number; code: string };
    err.statusCode = 404;
    err.code = 'BOOKING_NOT_FOUND';
    throw err;
  }

  const booking = bookings[0];

  // Check permission: only owner or admin can view
  if (!isAdmin && booking.user_id !== userId) {
    const err = new Error('Tidak memiliki izin untuk melihat booking ini') as Error & { statusCode: number; code: string };
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const { 
    user_id_join, user_name, user_email, user_role, user_faculty,
    room_id_join, room_name, room_building, room_capacity,
    ...bookingData 
  } = booking;

  if (bookingData.date instanceof Date) {
    bookingData.date = bookingData.date.toISOString().split('T')[0];
  }

  return {
    ...bookingData,
    user: { 
      id: user_id_join, 
      name: user_name, 
      email: user_email, 
      role: user_role,
      faculty: user_faculty,
      created_at: booking.created_at || new Date().toISOString()
    },
    room: { 
      id: room_id_join, 
      name: room_name, 
      building: room_building,
      capacity: room_capacity
    }
  };
}

// ─── GET DASHBOARD STATS ──────────────────────────────────────────────────────
export async function getDashboardStats(userId: string, role: string) {
  const isAdmin = role === 'admin';
  
  let queryBase = 'FROM bookings WHERE 1=1';
  const params: any[] = [];
  
  if (!isAdmin) {
    queryBase += ' AND user_id = ?';
    params.push(userId);
  }
  
  const [totalRows] = await db.execute<RowDataPacket[]>(`SELECT COUNT(*) as count ${queryBase}`, params);
  const [pendingRows] = await db.execute<RowDataPacket[]>(`SELECT COUNT(*) as count ${queryBase} AND status = 'pending'`, params);
  const [approvedRows] = await db.execute<RowDataPacket[]>(`SELECT COUNT(*) as count ${queryBase} AND status = 'approved'`, params);
  const [rejectedRows] = await db.execute<RowDataPacket[]>(`SELECT COUNT(*) as count ${queryBase} AND status = 'rejected'`, params);
  const [completedRows] = await db.execute<RowDataPacket[]>(`SELECT COUNT(*) as count ${queryBase} AND status = 'completed'`, params);

  return {
    total: totalRows[0]?.count ?? 0,
    pending: pendingRows[0]?.count ?? 0,
    approved: approvedRows[0]?.count ?? 0,
    rejected: rejectedRows[0]?.count ?? 0,
    completed: completedRows[0]?.count ?? 0,
  };
}

// ─── GET ADMIN STATS ──────────────────────────────────────────────────────────
export async function getAdminStats() {
  // 1. Total bookings
  const [totalBookingsRows] = await db.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM bookings');
  const totalBookings = totalBookingsRows[0]?.count ?? 0;

  // 2. Active rooms (status = 'available' or 'occupied')
  const [activeRoomsRows] = await db.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM rooms WHERE status != 'maintenance'");
  const activeRooms = activeRoomsRows[0]?.count ?? 0;

  // 3. Registered users
  const [totalUsersRows] = await db.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM users WHERE role != 'admin'");
  const totalUsers = totalUsersRows[0]?.count ?? 0;

  // 4. Approval rate
  const [approvedRows] = await db.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM bookings WHERE status = 'approved'");
  const approved = approvedRows[0]?.count ?? 0;
  
  const [completedRows] = await db.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'");
  const completed = completedRows[0]?.count ?? 0;

  const [rejectedRows] = await db.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM bookings WHERE status = 'rejected'");
  const rejected = rejectedRows[0]?.count ?? 0;

  const [pendingRows] = await db.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'");
  const pending = pendingRows[0]?.count ?? 0;

  const totalEvaluated = approved + completed + rejected;
  const approvalRate = totalEvaluated > 0 ? Math.round(((approved + completed) / totalEvaluated) * 100) : 0;

  // 5. Weekly bookings chart
  const [weeklyRows] = await db.execute<RowDataPacket[]>(`
    SELECT DAYOFWEEK(date) as day_num, COUNT(*) as count 
    FROM bookings 
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DAYOFWEEK(date)
  `);

  const daysMapping = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const weeklyMap: Record<string, number> = {
    'Sen': 0, 'Sel': 0, 'Rab': 0, 'Kam': 0, 'Jum': 0, 'Sab': 0, 'Min': 0
  };

  weeklyRows.forEach(row => {
    const dayName = daysMapping[row.day_num - 1];
    if (dayName) {
      weeklyMap[dayName] = row.count;
    }
  });

  const weekly = [
    { day: 'Sen', bookings: weeklyMap['Sen'] },
    { day: 'Sel', bookings: weeklyMap['Sel'] },
    { day: 'Rab', bookings: weeklyMap['Rab'] },
    { day: 'Kam', bookings: weeklyMap['Kam'] },
    { day: 'Jum', bookings: weeklyMap['Jum'] },
    { day: 'Sab', bookings: weeklyMap['Sab'] },
    { day: 'Min', bookings: weeklyMap['Min'] },
  ];

  return {
    totalBookings,
    activeRooms,
    totalUsers,
    approvalRate,
    pending,
    approved,
    rejected,
    completed,
    weekly
  };
}
