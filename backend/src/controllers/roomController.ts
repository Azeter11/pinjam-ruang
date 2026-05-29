import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { successResponse } from '../utils/response';
import * as roomService from '../services/roomService';

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────
export const createRoomSchema = z.object({
  name: z.string().min(1, 'Nama ruangan wajib diisi'),
  building: z.string().min(1, 'Gedung wajib diisi'),
  capacity: z.number().int().positive('Kapasitas harus bilangan positif'),
  facility: z.array(z.string()).default([]),
  image: z.string().optional().or(z.literal('')),
  status: z.enum(['available', 'occupied', 'maintenance']).default('available'),
});

export const updateRoomSchema = createRoomSchema.partial();

// ─── CONTROLLERS ─────────────────────────────────────────────────────────────
export async function getRooms(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { building, status, search, page, limit } = req.query as {
      building?: string;
      status?: 'available' | 'occupied' | 'maintenance';
      search?: string;
      page?: string;
      limit?: string;
    };
    const rooms = await roomService.getRooms({
      building,
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    successResponse(res, rooms, 'Daftar ruangan berhasil diambil');
  } catch (error) {
    next(error);
  }
}

export async function getRoomById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const room = await roomService.getRoomById(req.params.id as string);
    successResponse(res, room, 'Detail ruangan berhasil diambil');
  } catch (error) {
    next(error);
  }
}

export async function createRoom(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const room = await roomService.createRoom(req.body);
    successResponse(res, room, 'Ruangan berhasil dibuat', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateRoom(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const room = await roomService.updateRoom(req.params.id as string, req.body);
    successResponse(res, room, 'Ruangan berhasil diupdate');
  } catch (error) {
    next(error);
  }
}

export async function deleteRoom(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await roomService.deleteRoom(req.params.id as string);
    successResponse(res, null, 'Ruangan berhasil dihapus');
  } catch (error) {
    next(error);
  }
}

export async function getRoomSchedule(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { startDate, endDate } = req.query;
    
    // Ensure startDate and endDate are strings or undefined
    const startDateStr = typeof startDate === 'string' ? startDate : undefined;
    const endDateStr = typeof endDate === 'string' ? endDate : undefined;
    
    const schedule = await roomService.getRoomSchedule(id, startDateStr, endDateStr);
    successResponse(res, schedule, 'Jadwal ruangan berhasil diambil');
  } catch (error) {
    next(error);
  }
}
