import { Router } from 'express';
import { apply, myApplications, jobApplicants, setStatus, receivedOverview, applyRules, updateApplicationRules } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';

const r = Router();

r.post('/', protect, authorize('jobseeker', 'admin'), writeLimiter, applyRules, apply);
r.get('/mine', protect, authorize('jobseeker', 'admin'), myApplications);
r.get('/received/overview', protect, authorize('employer', 'admin'), receivedOverview);
r.get('/job/:jobId', protect, authorize('employer', 'admin'), jobApplicants);
r.patch('/:id', protect, authorize('employer', 'admin'), writeLimiter, updateApplicationRules, setStatus);

export default r;
