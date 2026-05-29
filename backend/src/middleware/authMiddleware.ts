import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { errorResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 'Token tidak ditemukan', 401, { code: 'NO_TOKEN' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      errorResponse(res, 'Token tidak valid', 401, { code: 'INVALID_TOKEN' });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        errorResponse(res, 'Token sudah kadaluarsa', 401, { code: 'TOKEN_EXPIRED' });
        return;
      }
      if (error.name === 'JsonWebTokenError') {
        errorResponse(res, 'Token tidak valid', 401, { code: 'INVALID_TOKEN' });
        return;
      }
    }
    errorResponse(res, 'Autentikasi gagal', 401, { code: 'AUTH_FAILED' });
  }
}
