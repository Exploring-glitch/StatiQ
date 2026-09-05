import { Router } from 'express';
import { apply, myApplications, jobApplicants, setStatus } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const r = Router();

r.post('/', protect, authorize('jobseeker', 'admin'), apply);
r.get('/mine', protect, authorize('jobseeker', 'admin'), myApplications);
r.get('/job/:jobId', protect, authorize('employer', 'admin'), jobApplicants);
r.patch('/:id', protect, authorize('employer', 'admin'), setStatus);

export default r;
