'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService } from '@/services/roomService';
import { Room, RoomFilter } from '@/types';

export function useRooms(filters?: RoomFilter) {
  return useQuery({
    queryKey: ['rooms', filters],
    queryFn: () => roomService.getRooms(filters),
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ['rooms', id],
    queryFn: () => roomService.getRoomById(id),
    enabled: !!id,
  });
}

export function useRoomSchedule(id: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['rooms', id, 'schedule', startDate, endDate],
    queryFn: () => roomService.getRoomSchedule(id, startDate, endDate),
    enabled: !!id && !!startDate && !!endDate,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Room, 'id' | 'created_at'>) => roomService.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Room> }) =>
      roomService.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roomService.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
