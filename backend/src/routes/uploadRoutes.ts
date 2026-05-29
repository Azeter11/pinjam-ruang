import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { uploadImage } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

// Admin-only: upload a room image
router.post(
  '/image',
  authMiddleware,
  requireRole('admin'),
  upload.single('image'),
  uploadImage
);

export default router;
