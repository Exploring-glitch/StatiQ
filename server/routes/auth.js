import { Router } from 'express';
import { register, login, me, registerRules, loginRules } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const r = Router();

r.post('/register', registerRules, register);
r.post('/login', loginRules, login);
r.get('/me', protect, me);

export default r;
