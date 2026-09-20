import { body, validationResult } from 'express-validator';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { asyncHandler } from '../middleware/auth.js';
import { escapeRegExp, isValidObjectId } from '../lib/validate.js';

const check = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }
};

// Fields a client may set on create/update. Everything else
// (postedBy, _id, timestamps, ...) is never taken from the request body.
const JOB_WRITE_FIELDS = [
  'title', 'company', 'companySlug', 'location', 'salary', 'salaryMin', 'salaryMax',
  'type', 'remote', 'workMode', 'experienceLevel', 'tags',
  'description', 'responsibilities', 'status',
];
const pickJobFields = (body = {}) =>
  Object.fromEntries(JOB_WRITE_FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

export const jobRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('salaryMin').optional({ nullable: true }).toFloat().isFloat({ min: 0 }).withMessage('Min salary must be positive'),
  body('salaryMax').optional({ nullable: true }).toFloat().isFloat({ min: 0 }).withMessage('Max salary must be positive')
    .custom((v, { req }) => {
      const min = req.body?.salaryMin;
      if (min != null && min !== '' && v != null && v !== '' && Number(v) < Number(min)) {
        throw new Error('Max salary must be >= min salary');
      }
      return true;
    }),
  body('type').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Internship']).withMessage('Invalid job type'),
  body('status').optional().isIn(['open', 'closed']).withMessage('Invalid status'),
  body('tags').optional().isArray({ max: 20 }).withMessage('Tags must be an array'),
  body('description').optional().isString().isLength({ max: 10000 }).withMessage('Description too long'),
  body('workMode').optional().isIn(['', 'Remote', 'Hybrid', 'On-site']).withMessage('Invalid work mode'),
  body('experienceLevel').optional().isIn(['', 'fresher', 'entry', 'mid', 'senior', 'lead', 'executive']).withMessage('Invalid experience level'),
];

// Partial-update rules: every field optional so PATCH-style PUTs
// (e.g. { status: 'closed' }) don't fail on missing title/company/location.
export const jobUpdateRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('company').optional().trim().notEmpty().withMessage('Company cannot be empty'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('salaryMin').optional({ nullable: true }).toFloat().isFloat({ min: 0 }).withMessage('Min salary must be positive'),
  body('salaryMax').optional({ nullable: true }).toFloat().isFloat({ min: 0 }).withMessage('Max salary must be positive')
    .custom((v, { req }) => {
      const min = req.body?.salaryMin;
      if (min != null && min !== '' && v != null && v !== '' && Number(v) < Number(min)) {
        throw new Error('Max salary must be >= min salary');
      }
      return true;
    }),
  body('type').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Internship']).withMessage('Invalid job type'),
  body('status').optional().isIn(['open', 'closed']).withMessage('Invalid status'),
  body('tags').optional().isArray({ max: 20 }).withMessage('Tags must be an array'),
  body('description').optional().isString().isLength({ max: 10000 }).withMessage('Description too long'),
  body('workMode').optional().isIn(['', 'Remote', 'Hybrid', 'On-site']).withMessage('Invalid work mode'),
  body('experienceLevel').optional().isIn(['', 'fresher', 'entry', 'mid', 'senior', 'lead', 'executive']).withMessage('Invalid experience level'),
];

// GET /api/jobs?q=&location=&remote=&type=&workMode=&experienceLevel=&minSalary=&sort=&page=&limit=
// Query enums are allowlisted so sanitized-but-unexpected values never reach Mongo operators.
const ALLOWED_JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const ALLOWED_WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const ALLOWED_LEVELS = ['', 'fresher', 'entry', 'mid', 'senior', 'lead', 'executive'];
export const listJobs = asyncHandler(async (req, res) => {
  const {
    q = '', location = '', remote, type = '', workMode = '',
    experienceLevel = '', minSalary = '', sort = 'newest',
    page = 1, limit = 12,
  } = req.query;
  const and = [{ status: 'open' }];
  if (q) and.push({ $text: { $search: q } });
  if (location) and.push({ location: new RegExp(escapeRegExp(location), 'i') });
  // workMode accepts CSV (e.g. Remote,Hybrid); legacy `remote=true` maps to Remote.
  const modes = String(workMode || '')
    .split(',')
    .map((m) => m.trim())
    .filter((m) => ALLOWED_WORK_MODES.includes(m));
  if (remote === 'true' && !modes.includes('Remote')) modes.push('Remote');
  if (modes.length) {
    if (modes.includes('Remote')) {
      and.push({ $or: [{ workMode: { $in: modes } }, { remote: true }] });
    } else {
      and.push({ workMode: { $in: modes } });
    }
  }
  if (type) {
    const types = String(type).split(',').map((t) => t.trim()).filter((t) => ALLOWED_JOB_TYPES.includes(t));
    if (types.length) and.push({ type: { $in: types } });
  }
  if (experienceLevel && ALLOWED_LEVELS.includes(experienceLevel)) and.push({ experienceLevel });
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

// GET /api/jobs/:id — public; only non-sensitive poster info is exposed.
export const getJob = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Job not found');
  }
  const job = await Job.findById(req.params.id).populate('postedBy', 'name company');
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  res.json(job);
});

// POST /api/jobs (employer/admin)
export const createJob = asyncHandler(async (req, res) => {
  check(req, res);
  const body = pickJobFields(req.body);
  for (const k of ['salaryMin', 'salaryMax']) {
    if (body[k] === '' || body[k] === undefined) body[k] = null;
  }
  const job = await Job.create({ ...body, postedBy: req.user._id });
  res.status(201).json(job);
});

// PUT /api/jobs/:id (owner or admin)
export const updateJob = asyncHandler(async (req, res) => {
  check(req, res);
  if (!isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Job not found');
  }
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
  Object.assign(job, pickJobFields(req.body));
  await job.save();
  res.json(job);
});

// DELETE /api/jobs/:id (owner or admin)
export const deleteJob = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Job not found');
  }
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
// Includes applicantCount per job (single aggregate) so the dashboard
// doesn't need one request per job (N+1).
export const myPostedJobs = asyncHandler(async (req, res) => {
  const items = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 }).lean();
  const ids = items.map((j) => j._id);
  const agg = ids.length
    ? await Application.aggregate([
        { $match: { job: { $in: ids } } },
        { $group: { _id: '$job', count: { $sum: 1 } } },
      ])
    : [];
  const counts = new Map(agg.map((a) => [String(a._id), a.count]));
  res.json(items.map((j) => ({ ...j, applicantCount: counts.get(String(j._id)) ?? 0 })));
});
