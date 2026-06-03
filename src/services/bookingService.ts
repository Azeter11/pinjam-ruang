import api from './api';
import { Booking, BookingConflict, BookingFilter, CreateBookingData, PaginatedResponse } from '@/types';

export const bookingService = {
  getBookings: async (params?: BookingFilter): Promise<PaginatedResponse<Booking>> => {
    const response = await api.get<PaginatedResponse<Booking>>('/api/bookings', { params });
    return response.data;
  },

  getAllBookings: async (params?: BookingFilter): Promise<PaginatedResponse<Booking>> => {
    const response = await api.get<PaginatedResponse<Booking>>('/api/admin/bookings', { params });
    return response.data;
  },

  getBookingById: async (id: string): Promise<Booking> => {
    const response = await api.get<Booking>(`/api/bookings/${id}`);
    return response.data;
  },

  createBooking: async (data: FormData): Promise<Booking> => {
    const response = await api.post<Booking>('/api/bookings', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateBookingStatus: async (
    id: string,
    status: Booking['status'],
    note?: string
  ): Promise<Booking> => {
    const response = await api.put<Booking>(`/api/bookings/${id}`, { status, note });
    return response.data;
  },

  cancelBooking: async (id: string): Promise<Booking> => {
    const response = await api.put<Booking>(`/api/bookings/${id}/cancel`);
    return response.data;
  },

  checkConflict: async (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<BookingConflict> => {
    const response = await api.get<BookingConflict>('/api/bookings/check-conflict', {
      params: { room_id: roomId, date, start_time: startTime, end_time: endTime },
    });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/api/bookings/stats');
    return response.data;
  },
};
