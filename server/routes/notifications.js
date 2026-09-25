import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  listNotifications,
  markRead,
  markAllRead,
  removeNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', protect, listNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markRead);
router.delete('/:id', protect, removeNotification);

export default router;
