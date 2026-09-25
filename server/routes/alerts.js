import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  myAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  previewAlert,
  alertRules,
} from '../controllers/alertController.js';

const router = express.Router();

router.get('/preview', protect, authorize('jobseeker', 'admin'), previewAlert);
router.get('/mine', protect, authorize('jobseeker', 'admin'), myAlerts);
router.post('/', protect, authorize('jobseeker', 'admin'), alertRules, createAlert);
router.put('/:id', protect, authorize('jobseeker', 'admin'), updateAlert);
router.delete('/:id', protect, authorize('jobseeker', 'admin'), deleteAlert);

export default router;
