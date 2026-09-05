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
];

// GET /api/jobs?q=&location=&remote=&type=&page=&limit=
export const listJobs = asyncHandler(async (req, res) => {
  const { q = '', location = '', remote, type = '', page = 1, limit = 12 } = req.query;
  const filter = { status: 'open' };
  if (q) filter.$text = { $search: q };
  if (location) filter.location = new RegExp(location, 'i');
  if (remote === 'true') filter.remote = true;
  if (type) filter.type = type;

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('postedBy', 'name company'),
    Job.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1 });
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
  const job = await Job.create({ ...req.body, postedBy: req.user._id });
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
