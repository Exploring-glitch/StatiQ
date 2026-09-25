import { body, validationResult } from 'express-validator';
import Job from '../models/Job.js';
import JobAlert from '../models/JobAlert.js';
import { asyncHandler } from '../middleware/auth.js';
import { escapeRegExp, isValidObjectId } from '../lib/validate.js';

const ALLOWED_JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const ALLOWED_WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const ALLOWED_LEVELS = ['', 'fresher', 'entry', 'mid', 'senior', 'lead', 'executive'];

const check = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }
};

export const alertRules = [
  body('name').trim().notEmpty().withMessage('Alert name is required').isLength({ max: 80 }).withMessage('Name too long'),
  body('query.q').optional().isString().isLength({ max: 120 }).withMessage('Search too long'),
  body('query.location').optional().isString().isLength({ max: 120 }).withMessage('Location too long'),
  body('frequency').optional().isIn(['instant', 'daily']).withMessage('Invalid frequency'),
];

const cleanQuery = (q = {}) => ({
  q: String(q.q ?? '').slice(0, 120),
  location: String(q.location ?? '').slice(0, 120),
  type: String(q.type ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter((t) => ALLOWED_JOB_TYPES.includes(t))
    .join(','),
  workMode: String(q.workMode ?? q.mode ?? '')
    .split(',')
    .map((m) => m.trim())
    .filter((m) => ALLOWED_WORK_MODES.includes(m))
    .join(','),
  experienceLevel: ALLOWED_LEVELS.includes(q.experienceLevel) ? q.experienceLevel : '',
  minSalary: String(q.minSalary ?? q.min ?? '').slice(0, 20),
  sort: ['', 'newest', 'salary'].includes(q.sort) ? q.sort : '',
});

// Shared predicate builder mirroring listJobs so preview + fan-out match browsing.
export const buildAlertFilter = (query = {}) => {
  const and = [{ status: 'open' }];
  if (query.q) and.push({ $text: { $search: query.q } });
  if (query.location) and.push({ location: new RegExp(escapeRegExp(query.location), 'i') });
  const modes = String(query.workMode || '').split(',').map((m) => m.trim()).filter((m) => ALLOWED_WORK_MODES.includes(m));
  if (modes.length) {
    if (modes.includes('Remote')) and.push({ $or: [{ workMode: { $in: modes } }, { remote: true }] });
    else and.push({ workMode: { $in: modes } });
  }
  if (query.type) {
    const types = String(query.type).split(',').map((t) => t.trim()).filter((t) => ALLOWED_JOB_TYPES.includes(t));
    if (types.length) and.push({ type: { $in: types } });
  }
  if (query.experienceLevel && ALLOWED_LEVELS.includes(query.experienceLevel)) and.push({ experienceLevel: query.experienceLevel });
  const min = Number(query.minSalary);
  if (query.minSalary !== '' && query.minSalary != null && !Number.isNaN(min)) {
    and.push({ $or: [{ salaryMax: null }, { salaryMax: { $gte: min } }] });
  }
  return and.length === 1 ? and[0] : { $and: and };
};

// GET /api/alerts/mine
export const myAlerts = asyncHandler(async (req, res) => {
  const items = await JobAlert.find({ user: req.user._id }).sort({ createdAt: -1 });
  const withCounts = await Promise.all(
    items.map(async (a) => {
      const total = await Job.countDocuments(buildAlertFilter(a.query || {}));
      return { ...a.toObject(), matchCount: total };
    })
  );
  res.json(withCounts);
});

// POST /api/alerts { name, query, frequency }
export const createAlert = asyncHandler(async (req, res) => {
  check(req, res);
  const count = await JobAlert.countDocuments({ user: req.user._id });
  if (count >= 10) {
    res.status(400);
    throw new Error('Alert limit reached (10). Delete one to add another.');
  }
  const query = cleanQuery(req.body.query || {});
  const alert = await JobAlert.create({
    user: req.user._id,
    name: String(req.body.name).trim().slice(0, 80),
    query,
    frequency: req.body.frequency === 'daily' ? 'daily' : 'instant',
  });
  res.status(201).json(alert);
});

// PUT /api/alerts/:id { name?, query?, frequency?, isActive? }
export const updateAlert = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Alert not found');
  }
  const alert = await JobAlert.findOne({ _id: req.params.id, user: req.user._id });
  if (!alert) {
    res.status(404);
    throw new Error('Alert not found');
  }
  if (req.body.name !== undefined) alert.name = String(req.body.name).trim().slice(0, 80) || alert.name;
  if (req.body.query !== undefined) alert.query = cleanQuery(req.body.query || {});
  if (req.body.frequency !== undefined && ['instant', 'daily'].includes(req.body.frequency)) alert.frequency = req.body.frequency;
  if (req.body.isActive !== undefined) alert.isActive = !!req.body.isActive;
  await alert.save();
  res.json(alert);
});

// DELETE /api/alerts/:id
export const deleteAlert = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Alert not found');
  }
  const alert = await JobAlert.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!alert) {
    res.status(404);
    throw new Error('Alert not found');
  }
  res.json({ message: 'Alert deleted' });
});

// GET /api/alerts/preview?q=&location=&type=&workMode=&experienceLevel=&minSalary=
export const previewAlert = asyncHandler(async (req, res) => {
  const query = cleanQuery({
    q: req.query.q, location: req.query.location, type: req.query.type,
    workMode: req.query.workMode || req.query.mode, experienceLevel: req.query.level || req.query.experienceLevel,
    minSalary: req.query.minSalary || req.query.min, sort: req.query.sort,
  });
  const total = await Job.countDocuments(buildAlertFilter(query));
  res.json({ query, matchCount: total });
});
