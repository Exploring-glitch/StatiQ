import { Router } from 'express';
import { register, login, me, updateMe, uploadResume, deleteResume, uploadAvatar, deleteAvatar, getSavedJobs, putSavedJobs, downloadResumeFile, changePassword, registerRules, loginRules, updateMeRules, changePasswordRules } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter, loginAccountGate, writeLimiter } from '../middleware/rateLimit.js';
import { resumeUpload, avatarUpload } from '../middleware/upload.js';

const r = Router();

r.post('/register', authLimiter, registerRules, register);
r.post('/login', authLimiter, loginAccountGate, loginRules, login);
r.get('/me', protect, me);
r.put('/me', protect, writeLimiter, updateMeRules, updateMe);
r.put('/me/password', protect, changePasswordRules, changePassword);
r.get('/me/saved', protect, getSavedJobs);
r.put('/me/saved', protect, writeLimiter, putSavedJobs);
r.post('/resume', protect, writeLimiter, resumeUpload.single('resume'), uploadResume);
r.delete('/resume', protect, writeLimiter, deleteResume);
r.get('/files/resumes/:name', protect, downloadResumeFile);
r.post('/avatar', protect, writeLimiter, avatarUpload.single('avatar'), uploadAvatar);
r.delete('/avatar', protect, writeLimiter, deleteAvatar);

export default r;
