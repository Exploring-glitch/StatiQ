import { Router } from 'express';
import {
  listCompanies, getMyCompany, listMyCompanies, upsertMyCompany, uploadLogo, uploadPersonPhoto, deletePersonPhoto, getCompany, companyWriteRules, listCompaniesRules,
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { logoUpload, peopleUpload } from '../middleware/upload.js';

const r = Router();

r.get('/', listCompaniesRules, listCompanies);
// Single-vs-multi contract: /me returns the first managed company (or null)
// for profile forms; /mine returns all managed companies for job-form selects.
r.get('/mine', protect, authorize('employer', 'admin'), listMyCompanies);
r.get('/me', protect, authorize('employer', 'admin'), getMyCompany);
r.put('/me', protect, authorize('employer', 'admin'), writeLimiter, companyWriteRules, upsertMyCompany);
r.post('/me/logo', protect, authorize('employer', 'admin'), writeLimiter, logoUpload.single('logo'), uploadLogo);
r.post('/me/people-photo', protect, authorize('employer', 'admin'), writeLimiter, peopleUpload.single('photo'), uploadPersonPhoto);
r.delete('/me/people-photo', protect, authorize('employer', 'admin'), writeLimiter, deletePersonPhoto);
r.get('/:slug', getCompany);

export default r;
