import { Router } from 'express';
import { register, login, me, updateMe, uploadResume, deleteResume, registerRules, loginRules, updateMeRules } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { resumeUpload } from '../middleware/upload.js';

const r = Router();

r.post('/register', registerRules, register);
r.post('/login', loginRules, login);
r.get('/me', protect, me);
r.put('/me', protect, updateMeRules, updateMe);
r.post('/resume', protect, resumeUpload.single('resume'), uploadResume);
r.delete('/resume', protect, deleteResume);

export default r;
