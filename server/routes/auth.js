import { Router } from 'express';
import { register, login, me, updateMe, uploadResume, deleteResume, uploadAvatar, deleteAvatar, getSavedJobs, putSavedJobs, registerRules, loginRules, updateMeRules } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { resumeUpload, avatarUpload } from '../middleware/upload.js';

const r = Router();

r.post('/register', authLimiter, registerRules, register);
r.post('/login', authLimiter, loginRules, login);
r.get('/me', protect, me);
r.put('/me', protect, updateMeRules, updateMe);
r.get('/me/saved', protect, getSavedJobs);
r.put('/me/saved', protect, putSavedJobs);
r.post('/resume', protect, resumeUpload.single('resume'), uploadResume);
r.delete('/resume', protect, deleteResume);
r.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);
r.delete('/avatar', protect, deleteAvatar);

export default r;
