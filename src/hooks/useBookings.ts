'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/bookingService';
import { Booking, BookingFilter, CreateBookingData } from '@/types';

export function useBookings(filters?: BookingFilter) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => bookingService.getBookings(filters),
  });
}

export function useAllBookings(filters?: BookingFilter) {
  return useQuery({
    queryKey: ['admin-bookings', filters],
    queryFn: () => bookingService.getAllBookings(filters),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingService.getBookingById(id),
    enabled: !!id,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => bookingService.getDashboardStats(),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => bookingService.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: Booking['status']; note?: string }) =>
      bookingService.updateBookingStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useCheckConflict(
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  enabled = false
) {
  return useQuery({
    queryKey: ['conflict-check', roomId, date, startTime, endTime],
    queryFn: () => bookingService.checkConflict(roomId, date, startTime, endTime),
    enabled: enabled && !!roomId && !!date && !!startTime && !!endTime,
  });
}
