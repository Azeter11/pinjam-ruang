export interface User {
  id: string;
  name: string;
  email: string;
  role: 'mahasiswa' | 'dosen' | 'organisasi' | 'admin';
  faculty?: string;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  facility: string[];
  image?: string;
  status: 'available' | 'occupied' | 'maintenance';
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  user?: User;
  room?: Room;
}

export interface BookingConflict {
  hasConflict: boolean;
  conflictingBookings?: Booking[];
}

export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'mahasiswa' | 'dosen' | 'organisasi';
  faculty?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RoomFilter {
  building?: string;
  capacity?: number;
  status?: Room['status'];
  search?: string;
}

export interface BookingFilter {
  status?: Booking['status'];
  date?: string;
  page?: number;
  limit?: number;
}

export interface CreateBookingData {
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  purpose: string;
}

export interface RoomUsageStat {
  room: Room;
  totalBookings: number;
  approvedBookings: number;
  utilizationRate: number;
}
