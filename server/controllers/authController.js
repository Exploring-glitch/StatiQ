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

export const updateMeRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('title').optional().trim(),
  body('location').optional().trim(),
  body('company').optional().trim(),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
];

// PUT /api/auth/me (protected) — edit own profile
export const updateMe = asyncHandler(async (req, res) => {
  check(req, res);
  const allowed = ['name', 'title', 'location', 'company', 'skills'];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }
  if (Array.isArray(updates.skills)) {
    updates.skills = updates.skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 30);
  }
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json(user.toSafeJSON());
});
