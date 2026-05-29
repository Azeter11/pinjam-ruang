import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { successResponse, errorResponse } from '../utils/response';
import * as bookingService from '../services/bookingService';
import { isValidTimeFormat, isValidTimeRange, isDateInFuture } from '../utils/dateHelper';

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────
export const createBookingSchema = z
  .object({
    room_id: z.string().uuid('room_id harus berformat UUID'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
    start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format waktu harus HH:MM'),
    end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format waktu harus HH:MM'),
    purpose: z.string().min(5, 'Tujuan peminjaman minimal 5 karakter'),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: 'Waktu mulai harus sebelum waktu selesai',
    path: ['end_time'],
  });

export const updateBookingStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

// ─── CONTROLLERS ─────────────────────────────────────────────────────────────
export async function getBookings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const isAdmin = req.user!.role === 'admin';
    const { status, date, room_id, page, limit } = req.query as {
      status?: 'pending' | 'approved' | 'rejected' | 'completed';
      date?: string;
      room_id?: string;
      page?: string;
      limit?: string;
    };

    const bookings = await bookingService.getBookings(
      {
        status,
        date,
        room_id,
        user_id: isAdmin ? undefined : req.user!.userId,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      },
      isAdmin
    );

    successResponse(res, bookings, 'Daftar booking berhasil diambil');
  } catch (error) {
    next(error);
  }
}

export async function checkConflict(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { room_id, date, start_time, end_time } = req.query as {
      room_id?: string;
      date?: string;
      start_time?: string;
      end_time?: string;
    };

    if (!room_id || !date || !start_time || !end_time) {
      errorResponse(res, 'room_id, date, start_time, end_time wajib diisi', 400, {
        code: 'MISSING_PARAMS',
      });
      return;
    }

    if (!isValidTimeFormat(start_time) || !isValidTimeFormat(end_time)) {
      errorResponse(res, 'Format waktu tidak valid (HH:MM)', 400, { code: 'INVALID_TIME_FORMAT' });
      return;
    }

    if (!isValidTimeRange(start_time, end_time)) {
      errorResponse(res, 'Waktu mulai harus sebelum waktu selesai', 400, {
        code: 'INVALID_TIME_RANGE',
      });
      return;
    }

    const result = await bookingService.checkConflict({ room_id, date, start_time, end_time });
    successResponse(res, result, 'Pengecekan konflik berhasil');
  } catch (error) {
    next(error);
  }
}

export async function createBooking(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date, start_time, end_time } = req.body;

    if (!isDateInFuture(date)) {
      errorResponse(res, 'Tidak bisa booking untuk tanggal yang sudah lewat', 400, {
        code: 'DATE_IN_PAST',
      });
      return;
    }

    const booking = await bookingService.createBooking({
      ...req.body,
      user_id: req.user!.userId,
    });

    successResponse(res, booking, 'Booking berhasil dibuat', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateBookingStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = req.body;
    const booking = await bookingService.updateBookingStatus(
      req.params.id as string,
      status,
      req.user!.userId
    );
    successResponse(res, booking, `Booking berhasil di-${status}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteBooking(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await bookingService.deleteBooking(
      req.params.id as string,
      req.user!.userId,
      req.user!.role === 'admin'
    );
    successResponse(res, null, 'Booking berhasil dihapus');
  } catch (error) {
    next(error);
  }
}

export async function getDashboardStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await bookingService.getDashboardStats(
      req.user!.userId,
      req.user!.role
    );
    successResponse(res, stats, 'Statistik dashboard berhasil diambil');
  } catch (error) {
    next(error);
  }
}

export async function getAdminStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await bookingService.getAdminStats();
    successResponse(res, stats, 'Statistik admin berhasil diambil');
  } catch (error) {
    next(error);
  }
}
