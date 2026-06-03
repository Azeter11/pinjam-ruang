import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { uploadProposal } from '../middleware/uploadMiddleware';

const router = Router();

// All authenticated users
router.get('/', authMiddleware, bookingController.getBookings);
router.get('/stats', authMiddleware, bookingController.getDashboardStats);
router.get('/check-conflict', bookingController.checkConflict);

// Admin stats
router.get('/admin/stats', authMiddleware, requireRole('admin'), bookingController.getAdminStats);

// Download PDF report (only for approved bookings)
router.get('/:id/pdf', authMiddleware, bookingController.downloadBookingPDF);

// Mahasiswa, Dosen, Organisasi can create bookings
router.post(
  '/',
  authMiddleware,
  requireRole('mahasiswa', 'dosen', 'organisasi', 'admin'),
  uploadProposal.single('proposal'),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          details: { proposal: ['Proposal peminjaman wajib diunggah (PDF)'] }
        }
      });
    }
    const protocol = req.protocol;
    const host = req.get('host');
    req.body.proposal_url = `${protocol}://${host}/uploads/${req.file.filename}`;
    next();
  },
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
