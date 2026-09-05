import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { asyncHandler, signToken } from '../middleware/auth.js';

const check = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }
};

export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password needs 8+ characters'),
  body('role').optional().isIn(['jobseeker', 'employer']).withMessage('Invalid role'),
];

export const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const tokenResponse = (user) => ({ token: signToken(user._id), user: user.toSafeJSON() });

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  check(req, res);
  const { name, email, password, role = 'jobseeker', title = '', location = '', company = '' } = req.body;
  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error('Email already registered');
  }
  const user = await User.create({ name, email, password, role, title, location, company });
  res.status(201).json(tokenResponse(user));
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  check(req, res);
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  res.json(tokenResponse(user));
});

// GET /api/auth/me (protected)
export const me = asyncHandler(async (req, res) => {
  res.json(req.user.toSafeJSON());
});
