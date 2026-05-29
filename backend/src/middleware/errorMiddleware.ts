import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { env } from '../config/env';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  }

  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  // JWT errors
  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: 'Token sudah kadaluarsa',
      data: null,
      error: { code: 'TOKEN_EXPIRED' },
    });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: 'Token tidak valid',
      data: null,
      error: { code: 'INVALID_TOKEN' },
    });
    return;
  }

  // Supabase / known errors with statusCode
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'Terjadi kesalahan server';
  const code = err.code ?? 'INTERNAL_ERROR';

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: { code },
  });
}
