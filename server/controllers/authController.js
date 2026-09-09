import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import { asyncHandler, signToken } from '../middleware/auth.js';
import { uploadsDir } from '../middleware/upload.js';

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
  // Accept optional rich-profile fields at signup too (all optional, validated by schema)
  const extra = {};
  for (const k of [
    'bio', 'phone', 'resumeUrl', 'portfolioUrl', 'linkedinUrl', 'githubUrl',
    'experienceYears', 'experienceLevel', 'workExperiences', 'openToWork',
    'pronouns', 'gender', 'ethnicity',
    'desiredRoles', 'jobTypes', 'workModes', 'desiredLocation', 'languages',
    'expectedSalaryMin', 'expectedSalaryMax', 'availability',
    'educationDegree', 'educationInstitution', 'graduationYear', 'skills',
  ]) {
    if (req.body[k] !== undefined) extra[k] = req.body[k];
  }
  const user = await User.create({ name, email, password, role, title, location, company, ...extra });
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

// POST /api/auth/resume (protected, multipart/form-data, field: "resume")
// Stores the file on disk, points user.resumeUrl at /uploads/<file>.
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file received — attach it as the "resume" field');
  }
  const user = await User.findById(req.user._id);
  // Remove the previous upload so disk doesn't fill with orphaned résumés.
  if (user.resumeUrl && user.resumeUrl.startsWith('/uploads/')) {
    const old = path.join(uploadsDir, path.basename(user.resumeUrl));
    fs.unlink(old, () => {});
  }
  user.resumeUrl = `/uploads/${req.file.filename}`;
  user.resumeName = req.file.originalname;
  await user.save();
  res.status(201).json(user.toSafeJSON());
});

// DELETE /api/auth/resume (protected) — remove uploaded résumé
export const deleteResume = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.resumeUrl && user.resumeUrl.startsWith('/uploads/')) {
    const old = path.join(uploadsDir, path.basename(user.resumeUrl));
    fs.unlink(old, () => {});
  }
  user.resumeUrl = '';
  user.resumeName = '';
  await user.save();
  res.json(user.toSafeJSON());
});

// POST /api/auth/avatar (protected, multipart/form-data, field: "avatar")
// Stores the image on disk, points user.avatarUrl at /uploads/<file>.
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file received — attach it as the "avatar" field');
  }
  const user = await User.findById(req.user._id);
  if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/')) {
    const old = path.join(uploadsDir, path.basename(user.avatarUrl));
    fs.unlink(old, () => {});
  }
  user.avatarUrl = `/uploads/${req.file.filename}`;
  await user.save();
  res.status(201).json(user.toSafeJSON());
});

// DELETE /api/auth/avatar (protected) — remove profile picture
export const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/')) {
    const old = path.join(uploadsDir, path.basename(user.avatarUrl));
    fs.unlink(old, () => {});
  }
  user.avatarUrl = '';
  await user.save();
  res.json(user.toSafeJSON());
});

export const updateMeRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('title').optional().trim(),
  body('location').optional().trim(),
  body('company').optional().trim(),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio must be under 1000 characters'),
  body('phone').optional().trim(),
  body('resumeUrl').optional().trim(),
  body('portfolioUrl').optional().trim(),
  body('linkedinUrl').optional().trim(),
  body('githubUrl').optional().trim(),
  body('experienceYears').optional({ nullable: true }).toFloat().isFloat({ min: 0, max: 50 }).withMessage('Experience must be 0–50 years'),
  body('experienceLevel').optional().isIn(['', 'fresher', 'entry', 'mid', 'senior', 'lead', 'executive']).withMessage('Invalid experience level'),
  body('workExperiences').optional().isArray({ max: 10 }).withMessage('Work experience must be a list (max 10)'),
  body('openToWork').optional().toBoolean().isBoolean().withMessage('openToWork must be true/false'),
  body('pronouns').optional().isIn(['', 'she-her', 'he-him', 'they-them', 'she-they', 'he-they', 'xe-xem', 'prefer-not-to-say']).withMessage('Invalid pronouns'),
  body('gender').optional().isIn(['', 'woman', 'man', 'non-binary', 'transgender', 'genderfluid', 'agender', 'prefer-not-to-say']).withMessage('Invalid gender'),
  body('ethnicity').optional().isIn(['', 'asian', 'black', 'hispanic', 'middle-eastern', 'native', 'pacific-islander', 'white', 'mixed', 'prefer-not-to-say']).withMessage('Invalid ethnicity'),
  body('desiredRoles').optional().isArray().withMessage('Desired roles must be an array'),
  body('jobTypes').optional().isArray().withMessage('Job types must be an array'),
  body('workModes').optional().isArray().withMessage('Work modes must be an array'),
  body('desiredLocation').optional().trim(),
  body('languages').optional().isArray().withMessage('Languages must be an array'),
  body('expectedSalaryMin').optional({ nullable: true }).toFloat().isFloat({ min: 0 }).withMessage('Min salary must be positive'),
  body('expectedSalaryMax').optional({ nullable: true }).toFloat().isFloat({ min: 0 }).withMessage('Max salary must be positive'),
  body('availability').optional().isIn(['', 'immediate', '2-weeks', '1-month', '2-months', 'open']).withMessage('Invalid availability'),
  body('educationDegree').optional().trim(),
  body('educationInstitution').optional().trim(),
  body('graduationYear').optional({ nullable: true }).toInt().isInt({ min: 1950, max: 2100 }).withMessage('Graduation year looks off'),
];

// PUT /api/auth/me (protected) — edit own profile
export const updateMe = asyncHandler(async (req, res) => {
  check(req, res);
  const allowed = [
    'name', 'title', 'location', 'company', 'skills',
    'bio', 'phone', 'resumeUrl', 'portfolioUrl', 'linkedinUrl', 'githubUrl',
    'experienceYears', 'experienceLevel', 'workExperiences', 'openToWork',
    'pronouns', 'gender', 'ethnicity',
    'desiredRoles', 'jobTypes', 'workModes', 'desiredLocation', 'languages',
    'expectedSalaryMin', 'expectedSalaryMax', 'availability',
    'educationDegree', 'educationInstitution', 'graduationYear',
  ];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }
  for (const k of ['skills', 'desiredRoles', 'jobTypes', 'workModes', 'languages']) {
    if (Array.isArray(updates[k])) {
      updates[k] = updates[k].map((s) => String(s).trim()).filter(Boolean).slice(0, 30);
    }
  }
  if (Array.isArray(updates.workExperiences)) {
    const str = (v, max) => String(v ?? '').trim().slice(0, max);
    updates.workExperiences = updates.workExperiences
      .slice(0, 10)
      .map((w) => {
        const current = !!w?.current;
        return {
          company: str(w?.company, 120),
          title: str(w?.title, 120),
          startDate: str(w?.startDate, 7),
          endDate: current ? '' : str(w?.endDate, 7),
          current,
          description: str(w?.description, 2000),
        };
      })
      .filter((w) => w.company || w.title || w.startDate || w.description);
  }
  for (const k of ['experienceYears', 'expectedSalaryMin', 'expectedSalaryMax', 'graduationYear']) {
    if (updates[k] === '' || updates[k] === null) updates[k] = null;
  }
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json(user.toSafeJSON());
});
