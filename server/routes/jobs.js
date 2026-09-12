import { Router } from 'express';
import {
  listJobs, getJob, createJob, updateJob, deleteJob, myPostedJobs, jobRules,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';

const r = Router();

r.get('/', listJobs);
r.get('/mine/posted', protect, authorize('employer', 'admin'), myPostedJobs);
r.get('/:id', getJob);
r.post('/', protect, authorize('employer', 'admin'), writeLimiter, jobRules, createJob);
r.put('/:id', protect, authorize('employer', 'admin'), writeLimiter, jobRules, updateJob);
r.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);

export default r;
