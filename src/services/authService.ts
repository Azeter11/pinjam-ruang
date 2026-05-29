import api from './api';
import { AuthResponse, LoginCredentials, RegisterData } from '@/types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const { confirmPassword, ...rest } = data;
    const response = await api.post<AuthResponse>('/api/auth/register', rest);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  me: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};
