'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { LoginCredentials, RegisterData } from '@/types';

export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      if (data.user.role === 'admin') {
        router.push('/admin/approval');
      } else {
        router.push('/dashboard');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.push('/dashboard');
    },
  });

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    loginMutation,
    registerMutation,
    logout,
  };
}
