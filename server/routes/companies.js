import { Router } from 'express';
import {
  listCompanies, getMyCompany, upsertMyCompany, getCompany, companyWriteRules,
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';

const r = Router();

r.get('/', listCompanies);
r.get('/me', protect, authorize('employer', 'admin'), getMyCompany);
r.put('/me', protect, authorize('employer', 'admin'), writeLimiter, companyWriteRules, upsertMyCompany);
r.get('/:slug', getCompany);

export default r;
