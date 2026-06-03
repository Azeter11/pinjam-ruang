import { Request } from 'express';

// ─── USER ────────────────────────────────────────────────────────────────────
export type UserRole = 'mahasiswa' | 'dosen' | 'organisasi' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  faculty?: string;
  created_at: string;
}

// ─── ROOM ────────────────────────────────────────────────────────────────────
export type RoomStatus = 'available' | 'occupied' | 'maintenance';

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  facility: string[];
  image?: string;
  status: RoomStatus;
  created_at: string;
}

// ─── BOOKING ─────────────────────────────────────────────────────────────────
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  purpose?: string | null;
  proposal_url: string;
  status: BookingStatus;
  created_at: string;
  // joined relations
  user?: User;
  room?: Room;
}

// ─── BOOKING LOG ─────────────────────────────────────────────────────────────
export interface BookingLog {
  id: string;
  booking_id: string;
  action: string;
  description?: string;
  created_at: string;
}

// ─── JWT PAYLOAD ─────────────────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── REQUEST AUGMENTATION ────────────────────────────────────────────────────
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ─── API RESPONSE ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error: {
    code: string;
    details?: unknown;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── FILTER PARAMS ───────────────────────────────────────────────────────────
export interface RoomFilters {
  building?: string;
  status?: RoomStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BookingFilters {
  status?: BookingStatus;
  date?: string;
  room_id?: string;
  user_id?: string;
  page?: number;
  limit?: number;
}

export interface ConflictCheckParams {
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
}
