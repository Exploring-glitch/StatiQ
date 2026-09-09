import { Router } from 'express';
import { register, login, me, updateMe, uploadResume, deleteResume, uploadAvatar, deleteAvatar, registerRules, loginRules, updateMeRules } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { resumeUpload, avatarUpload } from '../middleware/upload.js';

const r = Router();

r.post('/register', registerRules, register);
r.post('/login', loginRules, login);
r.get('/me', protect, me);
r.put('/me', protect, updateMeRules, updateMe);
r.post('/resume', protect, resumeUpload.single('resume'), uploadResume);
r.delete('/resume', protect, deleteResume);
r.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);
r.delete('/avatar', protect, deleteAvatar);

export default r;
