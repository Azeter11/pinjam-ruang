import { Router } from 'express';
import * as roomController from '../controllers/roomController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { validate } from '../middleware/validateMiddleware';

const router = Router();

// Public routes
router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoomById);
router.get('/:id/schedule', roomController.getRoomSchedule); // New endpoint for room schedule

// Admin-only routes
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  validate(roomController.createRoomSchema),
  roomController.createRoom
);
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  validate(roomController.updateRoomSchema),
  roomController.updateRoom
);
router.delete('/:id', authMiddleware, requireRole('admin'), roomController.deleteRoom);

export default router;
