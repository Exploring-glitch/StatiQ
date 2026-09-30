import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  listNotifications,
  markRead,
  markAllRead,
  removeNotification,
} from '../controllers/notificationController.js';
import { writeLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.get('/', protect, listNotifications);
router.patch('/read-all', protect, writeLimiter, markAllRead);
router.patch('/:id/read', protect, writeLimiter, markRead);
router.delete('/:id', protect, writeLimiter, removeNotification);

export default router;
