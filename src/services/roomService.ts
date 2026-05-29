import api from './api';
import { Room, RoomFilter, PaginatedResponse } from '@/types';

export const roomService = {
  getRooms: async (filters?: RoomFilter): Promise<PaginatedResponse<Room>> => {
    const response = await api.get<PaginatedResponse<Room>>('/api/rooms', { params: filters });
    return response.data;
  },

  getRoomById: async (id: string): Promise<Room> => {
    const response = await api.get<Room>(`/api/rooms/${id}`);
    return response.data;
  },

  createRoom: async (data: Omit<Room, 'id' | 'created_at'>): Promise<Room> => {
    const response = await api.post<Room>('/api/rooms', data);
    return response.data;
  },

  updateRoom: async (id: string, data: Partial<Room>): Promise<Room> => {
    const response = await api.put<Room>(`/api/rooms/${id}`, data);
    return response.data;
  },

  deleteRoom: async (id: string): Promise<void> => {
    await api.delete(`/api/rooms/${id}`);
  },

  uploadRoomImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post<{ url: string }>('/api/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },

  getRoomSchedule: async (id: string, startDate: string, endDate: string) => {
    const response = await api.get(`/api/rooms/${id}/schedule`, {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

