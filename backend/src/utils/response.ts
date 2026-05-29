import { Response } from 'express';
import { ApiResponse } from '../types';

export function successResponse<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response<ApiResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
  });
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 500,
  errorDetails?: { code: string; details?: unknown }
): Response<ApiResponse<null>> {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: errorDetails ?? { code: 'INTERNAL_ERROR' },
  });
}
