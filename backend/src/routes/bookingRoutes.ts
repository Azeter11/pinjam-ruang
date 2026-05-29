import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validate } from '../middleware/validateMiddleware';

const router = Router();

// All authenticated users
router.get('/', authMiddleware, bookingController.getBookings);
router.get('/stats', authMiddleware, bookingController.getDashboardStats);
router.get('/check-conflict', bookingController.checkConflict);

// Mahasiswa, Dosen, Organisasi can create bookings
router.post(
  '/',
  authMiddleware,
  requireRole('mahasiswa', 'dosen', 'organisasi', 'admin'),
  validate(bookingController.createBookingSchema),
  bookingController.createBooking
);

// Admin only: update status
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  validate(bookingController.updateBookingStatusSchema),
  bookingController.updateBookingStatus
);

// Owner or admin: delete (only pending)
router.delete('/:id', authMiddleware, bookingController.deleteBooking);

export default router;
