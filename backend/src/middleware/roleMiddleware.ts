import { Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import { AuthenticatedRequest, UserRole } from '../types';

/**
 * Factory function: requireRole('admin', 'dosen')
 * Pastikan authMiddleware sudah dipasang sebelum ini.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Tidak terautentikasi', 401, { code: 'UNAUTHENTICATED' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      errorResponse(
        res,
        `Akses ditolak. Role yang diizinkan: ${roles.join(', ')}`,
        403,
        { code: 'FORBIDDEN', details: { requiredRoles: roles, userRole: req.user.role } }
      );
      return;
    }

    next();
  };
}
