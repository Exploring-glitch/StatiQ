import { Router } from 'express';
import { register, login, me, updateMe, registerRules, loginRules, updateMeRules } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const r = Router();

r.post('/register', registerRules, register);
r.post('/login', loginRules, login);
r.get('/me', protect, me);
r.put('/me', protect, updateMeRules, updateMe);

export default r;
