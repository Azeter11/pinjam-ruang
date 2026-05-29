'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

interface BookingUpdateEvent {
  booking_id: string;
  user_id: string;
  status: string;
  room_name: string;
}

interface RoomStatusEvent {
  room_id: string;
  status: string;
}

export function useSocket(onBookingUpdate?: (data: BookingUpdateEvent) => void) {
  const queryClient = useQueryClient();
  const { token, user } = useAuthStore();
  const socketRef = useRef<ReturnType<typeof import('socket.io-client').io> | null>(null);

  useEffect(() => {
    if (!token || typeof window === 'undefined') return;

    let socket: ReturnType<typeof import('socket.io-client').io>;

    const initSocket = async () => {
      const { io } = await import('socket.io-client');
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[Socket] Connected:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('[Socket] Disconnected');
      });

      socket.on('booking_status_updated', (data: BookingUpdateEvent) => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

        if (data.user_id === user?.id && onBookingUpdate) {
          onBookingUpdate(data);
        }
      });

      socket.on('room_status_changed', (_data: RoomStatusEvent) => {
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
      });
    };

    initSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token, user?.id, queryClient, onBookingUpdate]);

  return { socket: socketRef.current };
}
