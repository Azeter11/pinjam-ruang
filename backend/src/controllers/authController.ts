import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { successResponse } from '../utils/response';
import * as authService from '../services/authService';

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['mahasiswa', 'dosen', 'organisasi', 'admin']).default('mahasiswa'),
  faculty: z.string().optional().nullable().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

// ─── CONTROLLERS ─────────────────────────────────────────────────────────────
export async function register(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.registerUser(req.body);
    successResponse(res, result, 'Registrasi berhasil', 201);
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.loginUser(req.body);
    successResponse(res, result, 'Login berhasil');
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    successResponse(res, null, 'Logout berhasil');
  } catch (error) {
    next(error);
  }
}

export async function getMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await authService.getUserById(userId);
    successResponse(res, user, 'Data user berhasil diambil');
  } catch (error) {
    next(error);
  }
}
