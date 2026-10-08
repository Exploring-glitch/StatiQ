import { body, query, validationResult } from 'express-validator';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { asyncHandler } from '../middleware/auth.js';
import { escapeRegExp, isValidObjectId } from '../lib/validate.js';
import { attachCompanyLogos } from '../lib/companyLogo.js';
import { canManageJob } from '../lib/canManageJob.js';

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
  'type', 'remote', 'workMode', 'experienceLevel',
  'experienceMinYears', 'experienceMaxYears', 'department',
  'tags',
  'description', 'responsibilities', 'requirements', 'niceToHaves', 'benefits',
  'interviewProcess',
  'openings', 'deadline', 'status',
];
const pickJobFields = (body = {}) =>
  Object.fromEntries(JOB_WRITE_FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

// List fields accept arrays (preferred) or raw strings — the form sends
// arrays, but direct API callers may send the textarea text as-is and the
// smart splitter (lib/lists.js) normalizes it on sanitize.
const listRule = (field, label) =>
  body(field).optional().custom((v) => {
    if (typeof v === 'string') {
      if (v.length > 10000) throw new Error(`${label} too long`);
      return true;
    }
    if (Array.isArray(v)) {
      if (v.length > 30) throw new Error(`${label} must have at most 30 items`);
      return true;
    }
    throw new Error(`${label} must be an array`);
  });

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
  body('status').optional().isIn(['open', 'closed', 'draft']).withMessage('Invalid status'),
  body('tags').optional().isArray({ max: 20 }).withMessage('Tags must be an array'),
  body('description').optional().isString().isLength({ max: 10000 }).withMessage('Description too long'),
  listRule('responsibilities', 'Responsibilities'),
  listRule('requirements', 'Requirements'),
  listRule('benefits', 'Benefits'),
  listRule('interviewProcess', 'Interview process'),
  body('openings').optional({ nullable: true }).toInt().isInt({ min: 1, max: 10000 }).withMessage('Openings must be at least 1'),
  body('deadline').optional({ nullable: true }).isISO8601().withMessage('Deadline must be a valid date'),
  body('workMode').optional().isIn(['', 'Remote', 'Hybrid', 'On-site']).withMessage('Invalid work mode'),
  body('experienceLevel').optional().isIn(['', 'fresher', 'entry', 'mid', 'senior', 'lead', 'executive']).withMessage('Invalid experience level'),
  body('experienceMinYears').optional({ nullable: true }).toFloat().isFloat({ min: 0, max: 50 }).withMessage('Min experience must be 0–50 years'),
  body('experienceMaxYears').optional({ nullable: true }).toFloat().isFloat({ min: 0, max: 50 }).withMessage('Max experience must be 0–50 years')
    .custom((v, { req }) => {
      const min = req.body?.experienceMinYears;
      if (min != null && min !== '' && v != null && v !== '' && Number(v) < Number(min)) {
        throw new Error('Max experience must be >= min experience');
      }
      return true;
    }),
  body('department').optional({ nullable: true }).isString().trim().isLength({ max: 80 }).withMessage('Department too long'),
  listRule('niceToHaves', 'Nice to haves'),
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
  body('status').optional().isIn(['open', 'closed', 'draft']).withMessage('Invalid status'),
  body('tags').optional().isArray({ max: 20 }).withMessage('Tags must be an array'),
  body('description').optional().isString().isLength({ max: 10000 }).withMessage('Description too long'),
  listRule('responsibilities', 'Responsibilities'),
  listRule('requirements', 'Requirements'),
  listRule('benefits', 'Benefits'),
  listRule('interviewProcess', 'Interview process'),
  body('openings').optional({ nullable: true }).toInt().isInt({ min: 1, max: 10000 }).withMessage('Openings must be at least 1'),
  body('deadline').optional({ nullable: true }).isISO8601().withMessage('Deadline must be a valid date'),
  body('workMode').optional().isIn(['', 'Remote', 'Hybrid', 'On-site']).withMessage('Invalid work mode'),
  body('experienceLevel').optional().isIn(['', 'fresher', 'entry', 'mid', 'senior', 'lead', 'executive']).withMessage('Invalid experience level'),
  body('experienceMinYears').optional({ nullable: true }).toFloat().isFloat({ min: 0, max: 50 }).withMessage('Min experience must be 0–50 years'),
  body('experienceMaxYears').optional({ nullable: true }).toFloat().isFloat({ min: 0, max: 50 }).withMessage('Max experience must be 0–50 years')
    .custom((v, { req }) => {
      const min = req.body?.experienceMinYears;
      if (min != null && min !== '' && v != null && v !== '' && Number(v) < Number(min)) {
        throw new Error('Max experience must be >= min experience');
      }
      return true;
    }),
  body('department').optional({ nullable: true }).isString().trim().isLength({ max: 80 }).withMessage('Department too long'),
  listRule('niceToHaves', 'Nice to haves'),
];

// Resolve which managed company a job belongs to (User → Company → Job).
// Today an employer manages one company; this helper already accepts an
// explicit companyId so multi-company forms work without API changes:
// unknown/foreign ids are ignored and fall back to the owner's company.
async function resolveCompanyId(userId, { companyId, company, companySlug }) {
  const { default: Company } = await import('../models/Company.js');
  if (companyId && isValidObjectId(String(companyId))) {
    const owned = await Company.findOne({ _id: companyId, owner: userId }).select('_id name slug').lean();
    if (owned) return owned;
  }
  const ors = [{ owner: userId }];
  if (companySlug) ors.push({ slug: String(companySlug).toLowerCase() });
  if (company) ors.push({ name: new RegExp(`^${escapeRegExp(String(company).trim())}$`, 'i') });
  // Prefer the employer's own company row; fall back to a slug match so a
  // renamed company still links correctly.
  const mine = await Company.findOne({ owner: userId }).select('_id name slug').lean();
  if (mine) return mine;
  if (companySlug || company) {
    const bySlug = await Company.findOne({ $or: ors.slice(1) }).select('_id name slug').lean();
    if (bySlug) return bySlug;
  }
  return null;
}

// GET /api/jobs?q=&location=&remote=&type=&workMode=&experienceLevel=&minSalary=&sort=&page=&limit=
// Strict query validators so typos fail with 400 (same contract as
// GET /api/alerts/preview). Runtime allowlists below stay as defense-in-depth.
const csvIn = (allowed) => (v) => {
  if (v === undefined || v === null || v === '') return true;
  const parts = String(v).split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length > 0 && parts.every((p) => allowed.includes(p));
};
const numericString = (v) => {
  if (v === undefined || v === null || v === '') return true;
  return !Number.isNaN(Number(v)) && Number(v) >= 0;
};
const ALLOWED_JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const ALLOWED_WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const ALLOWED_LEVELS = ['', 'fresher', 'entry', 'mid', 'senior', 'lead', 'executive'];
export const listJobsRules = [
  query('q').optional().isString().isLength({ max: 120 }).withMessage('Search too long'),
  query('location').optional().isString().isLength({ max: 120 }).withMessage('Location too long'),
  query('remote').optional().isIn(['', 'true', 'false']).withMessage('Invalid remote flag'),
  query('type').optional().custom(csvIn(ALLOWED_JOB_TYPES)).withMessage('Invalid job type'),
  query('workMode').optional().custom(csvIn(ALLOWED_WORK_MODES)).withMessage('Invalid work mode'),
  query('experienceLevel').optional().isIn(ALLOWED_LEVELS).withMessage('Invalid experience level'),
  query('minSalary').optional().custom(numericString).withMessage('Min salary must be positive'),
  query('sort').optional().isIn(['', 'newest', 'salary']).withMessage('Invalid sort'),
  query('page').optional().isInt({ min: 1, max: 1000 }).withMessage('Invalid page'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Invalid limit'),
];
// Query enums are allowlisted so sanitized-but-unexpected values never reach Mongo operators.
export const listJobs = asyncHandler(async (req, res) => {
  check(req, res);
  const {
    q = '', location = '', remote, type = '', workMode = '',
    experienceLevel = '', minSalary = '', sort = 'newest',
    page = 1, limit = 12,
  } = req.query;
  const and = [{ status: 'open' }];
  const cappedQ = String(q || '').slice(0, 120);
  if (cappedQ) and.push({ $text: { $search: cappedQ } });
  if (location) and.push({ location: new RegExp(escapeRegExp(String(location).slice(0, 120)), 'i') });
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
  const withLogos = await attachCompanyLogos(items);
  res.json({ items: withLogos, total, page: Number(page), pages: Math.ceil(total / lim) || 1 });
});

// GET /api/jobs/:id — public for open roles; drafts/closed need owner/admin.
// Non-open jobs return 404 for strangers to avoid enumerating private roles.
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
  if (job.status !== 'open') {
    const user = req.user;
    let allowed = user?.role === 'admin' || job.postedBy?._id?.toString() === user?._id?.toString() || job.postedBy?.toString() === user?._id?.toString();
    if (!allowed && user && job.companyId) {
      const { default: Company } = await import('../models/Company.js');
      allowed = !!(await Company.exists({ _id: job.companyId, owner: user._id }));
    }
    if (!allowed) {
      res.status(404);
      throw new Error('Job not found');
    }
  }
  const withLogo = await attachCompanyLogos(job);
  res.json(withLogo);
});

// POST /api/jobs (employer/admin)
export const createJob = asyncHandler(async (req, res) => {
  check(req, res);
  const body = pickJobFields(req.body);
  for (const k of ['salaryMin', 'salaryMax', 'experienceMinYears', 'experienceMaxYears']) {
    if (body[k] === '' || body[k] === undefined) body[k] = null;
  }
  for (const k of ['requirements', 'benefits', 'responsibilities', 'tags', 'niceToHaves']) {
    if (Array.isArray(body[k])) body[k] = body[k].map((s) => String(s).trim()).filter(Boolean).slice(0, 30);
  }
  if (body.department !== undefined && body.department !== null) {
    body.department = String(body.department).trim().slice(0, 80);
  }
  if (body.openings === '' || body.openings === undefined || body.openings === null) body.openings = 1;
  else body.openings = Math.max(1, Number(body.openings) || 1);
  if (body.deadline === '' || body.deadline === undefined) body.deadline = null;
  if (body.company && !body.companySlug) {
    body.companySlug = String(body.company).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
  }
  // Bind the job to the managed company (User → Company → Job) so the role
  // publicly appears under the brand (e.g. Lupira), never the person.
  // Accepts an explicit companyId for multi-company forms; it must belong
  // to the poster or it is ignored.
  try {
    const managed = await resolveCompanyId(req.user._id, {
      companyId: req.body?.companyId, company: body.company, companySlug: body.companySlug,
    });
    if (managed) {
      body.companyId = managed._id;
      body.company = body.company || managed.name;
      body.companySlug = managed.slug || body.companySlug;
    }
  } catch { /* binding is best-effort; the job still saves */ }
  const job = await Job.create({ ...body, postedBy: req.user._id });
  // Instant job-alert fan-out: seekers with matching active alerts get a notification.
  try {
    const { fanoutNewJobMatches } = await import('../lib/notify.js');
    fanoutNewJobMatches(job).catch(() => {});
  } catch { /* notifications are best-effort */ }
  // Keep the public company profile in sync: first post creates it so the
  // Jobs tab lists every role for the brand without extra employer steps.
  try {
    const { default: Company } = await import('../models/Company.js');
    if (body.company) {
      const slug = body.companySlug;
      const exists = await Company.exists({ $or: [{ slug }, { owner: req.user._id }] });
      if (!exists && slug) {
        await Company.create({ name: String(body.company).trim().slice(0, 120), slug, owner: req.user._id });
      }
    }
  } catch { /* profile sync is best-effort; job creation already succeeded */ }
  res.status(201).json(job);
});

// PUT /api/jobs/:id (owner, company manager, or admin)
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
  if (!(await canManageJob(req.user, job))) {
    res.status(403);
    throw new Error('Not your job to edit');
  }
  const patch = pickJobFields(req.body);
  for (const k of ['requirements', 'benefits', 'responsibilities', 'tags', 'niceToHaves']) {
    if (Array.isArray(patch[k])) patch[k] = patch[k].map((s) => String(s).trim()).filter(Boolean).slice(0, 30);
  }
  for (const k of ['experienceMinYears', 'experienceMaxYears']) {
    if (patch[k] === '') patch[k] = null;
  }
  if (patch.department !== undefined && patch.department !== null) {
    patch.department = String(patch.department).trim().slice(0, 80);
  }
  if (patch.openings === '') patch.openings = 1;
  if (patch.deadline === '') patch.deadline = null;
  // Keep the company binding fresh when the brand is renamed or the
  // multi-company selector moves the role to another managed company.
  if (req.body?.companyId !== undefined || patch.company !== undefined || patch.companySlug !== undefined) {
    try {
      const managed = await resolveCompanyId(req.user._id, {
        companyId: req.body?.companyId,
        company: patch.company ?? job.company,
        companySlug: patch.companySlug ?? job.companySlug,
      });
      if (managed) {
        // Never steal a job into a company the editor doesn't manage.
        const { default: Company } = await import('../models/Company.js');
        const allowed = await Company.exists({ _id: managed._id, owner: req.user._id });
        if (allowed || req.user.role === 'admin') {
          patch.companyId = managed._id;
          patch.companySlug = managed.slug || patch.companySlug;
        }
      }
    } catch { /* keep the previous binding */ }
  }
  Object.assign(job, patch);
  await job.save();
  res.json(job);
});

// DELETE /api/jobs/:id (owner, company manager, or admin)
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
  if (!(await canManageJob(req.user, job))) {
    res.status(403);
    throw new Error('Not your job to delete');
  }
  await job.deleteOne();
  res.json({ message: 'Job deleted' });
});

// GET /api/jobs/mine/posted (employer/admin)
// Managed jobs = posted by me OR bound to a company I own (same scope as
// GET /api/applications/received/overview). Includes applicantCount per job
// (single aggregate) so the dashboard doesn't need one request per job (N+1).
export const myPostedJobs = asyncHandler(async (req, res) => {
  const { default: Company } = await import('../models/Company.js');
  const myCompanies = await Company.find({ owner: req.user._id }).select('_id').lean();
  const myCompanyIds = myCompanies.map((c) => c._id);
  const items = await Job.find({
    $or: [
      { postedBy: req.user._id },
      ...(myCompanyIds.length ? [{ companyId: { $in: myCompanyIds } }] : []),
    ],
  }).sort({ createdAt: -1 }).lean();
  const ids = items.map((j) => j._id);
  const agg = ids.length
    ? await Application.aggregate([
        { $match: { job: { $in: ids } } },
        { $group: { _id: '$job', count: { $sum: 1 } } },
      ])
    : [];
  const counts = new Map(agg.map((a) => [String(a._id), a.count]));
  const withLogos = await attachCompanyLogos(items);
  res.json(withLogos.map((j) => ({ ...j, applicantCount: counts.get(String(j._id)) ?? 0 })));
});
