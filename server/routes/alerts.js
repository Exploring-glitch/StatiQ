import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  myAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  previewAlert,
  alertRules,
  alertUpdateRules,
  previewRules,
} from '../controllers/alertController.js';
import { writeLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.get('/preview', protect, authorize('jobseeker', 'admin'), previewRules, previewAlert);
router.get('/mine', protect, authorize('jobseeker', 'admin'), myAlerts);
router.post('/', protect, authorize('jobseeker', 'admin'), writeLimiter, alertRules, createAlert);
router.put('/:id', protect, authorize('jobseeker', 'admin'), writeLimiter, alertUpdateRules, updateAlert);
router.delete('/:id', protect, authorize('jobseeker', 'admin'), writeLimiter, deleteAlert);

export default router;
