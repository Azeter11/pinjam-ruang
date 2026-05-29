import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes';
import roomRoutes from './roomRoutes';
import bookingRoutes from './bookingRoutes';
import * as bookingController from '../controllers/bookingController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Pinjam Ruang API is running',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
    error: null,
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);

// Admin-only routes
router.get('/admin/bookings', authMiddleware, requireRole('admin'), bookingController.getBookings);
router.get('/admin/stats', authMiddleware, requireRole('admin'), bookingController.getAdminStats);

export default router;
