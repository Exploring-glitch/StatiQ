import { body, validationResult } from 'express-validator';
import Job from '../models/Job.js';
import { asyncHandler } from '../middleware/auth.js';

const check = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }
};

export const jobRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('salaryMin').optional({ nullable: true }).toFloat().isFloat({ min: 0 }).withMessage('Min salary must be positive'),
  body('salaryMax').optional({ nullable: true }).toFloat().isFloat({ min: 0 }).withMessage('Max salary must be positive'),
  body('workMode').optional().isIn(['', 'Remote', 'Hybrid', 'On-site']).withMessage('Invalid work mode'),
  body('experienceLevel').optional().isIn(['', 'fresher', 'entry', 'mid', 'senior', 'lead', 'executive']).withMessage('Invalid experience level'),
];

// GET /api/jobs?q=&location=&remote=&type=&workMode=&experienceLevel=&minSalary=&sort=&page=&limit=
export const listJobs = asyncHandler(async (req, res) => {
  const {
    q = '', location = '', remote, type = '', workMode = '',
    experienceLevel = '', minSalary = '', sort = 'newest',
    page = 1, limit = 12,
  } = req.query;
  const and = [{ status: 'open' }];
  if (q) and.push({ $text: { $search: q } });
  if (location) and.push({ location: new RegExp(location, 'i') });
  // workMode is the modern filter; legacy `remote=true` maps to Remote.
  const mode = workMode || (remote === 'true' ? 'Remote' : '');
  if (mode === 'Remote') and.push({ $or: [{ workMode: 'Remote' }, { remote: true }] });
  else if (mode) and.push({ workMode: mode });
  if (type) {
    const types = String(type).split(',').map((t) => t.trim()).filter(Boolean);
    if (types.length) and.push({ type: { $in: types } });
  }
  if (experienceLevel) and.push({ experienceLevel });
  const min = Number(minSalary);
  if (minSalary !== '' && !Number.isNaN(min)) {
    // Jobs without salary data still show (don't punish missing data).
    and.push({ $or: [{ salaryMax: null }, { salaryMax: { $gte: min } }] });
  }

  const filter = and.length === 1 ? and[0] : { $and: and };
  const sortBy = sort === 'salary' ? { salaryMax: -1, createdAt: -1 } : { createdAt: -1 };
  const lim = Math.min(50, Math.max(1, Number(limit) || 12));
  const skip = (Math.max(1, Number(page)) - 1) * lim;
  const [items, total] = await Promise.all([
    Job.find(filter).sort(sortBy).skip(skip).limit(lim).populate('postedBy', 'name company'),
    Job.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / lim) || 1 });
});

// GET /api/jobs/:id
export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name company email');
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  res.json(job);
});

// POST /api/jobs (employer/admin)
export const createJob = asyncHandler(async (req, res) => {
  check(req, res);
  const body = { ...req.body };
  for (const k of ['salaryMin', 'salaryMax']) {
    if (body[k] === '' || body[k] === undefined) body[k] = null;
  }
  const job = await Job.create({ ...body, postedBy: req.user._id });
  res.status(201).json(job);
});

// PUT /api/jobs/:id (owner or admin)
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  const isOwner = job.postedBy?.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not your job to edit');
  }
  Object.assign(job, req.body);
  await job.save();
  res.json(job);
});

// DELETE /api/jobs/:id (owner or admin)
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  const isOwner = job.postedBy?.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not your job to delete');
  }
  await job.deleteOne();
  res.json({ message: 'Job deleted' });
});

// GET /api/jobs/mine/posted (employer/admin)
export const myPostedJobs = asyncHandler(async (req, res) => {
  const items = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  res.json(items);
});
