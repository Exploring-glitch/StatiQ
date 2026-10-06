import { body, validationResult } from 'express-validator';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { asyncHandler } from '../middleware/auth.js';
import { isValidObjectId } from '../lib/validate.js';
import { canManageJob } from '../lib/canManageJob.js';

export const applyRules = [
  body('jobId').isMongoId().withMessage('Invalid job id'),
  body('coverNote').trim().isLength({ min: 50, max: 2000 }).withMessage('Tell the company why you want to join (50–2000 characters)'),
];

export const updateApplicationRules = [
  body('status').optional().isIn(['applied', 'reviewing', 'interview', 'offer', 'rejected']).withMessage('Invalid status'),
  body('mark').optional().isIn(['', 'best', 'good', 'maybe', 'not-good']).withMessage('Invalid mark'),
];

// POST /api/applications { jobId, coverNote } (jobseeker)
// coverNote is the required "Why our company?" answer (50–2000 chars).
export const apply = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }
  const { jobId } = req.body;
  const coverNote = String(req.body?.coverNote ?? '').trim().slice(0, 2000);
  if (!jobId || !isValidObjectId(jobId)) {
    res.status(404);
    throw new Error('Job not open for applications');
  }
  const job = await Job.findById(jobId);
  if (!job || job.status !== 'open') {
    res.status(404);
    throw new Error('Job not open for applications');
  }
  try {
    const app = await Application.create({ job: jobId, applicant: req.user._id, coverNote });
    try {
      const { notifyNewApplicant } = await import('../lib/notify.js');
      notifyNewApplicant({ employerId: job.postedBy, job, applicantName: req.user.name }).catch(() => {});
    } catch { /* best-effort */ }
    res.status(201).json(app);
  } catch (e) {
    if (e.code === 11000) {
      res.status(400);
      throw new Error('Already applied to this job');
    }
    throw e;
  }
});

// GET /api/applications/received/overview (employer/admin)
// One call powering the employer Dashboard + Applicants overview:
// totals, per-job status buckets and the latest applications across every
// job the employer manages (User → Company → Jobs → Applications).
// "New" = status `applied` (untriaged), independent of age.
export const receivedOverview = asyncHandler(async (req, res) => {
  const { default: Job } = await import('../models/Job.js');
  const { default: Company } = await import('../models/Company.js');
  const myCompanies = await Company.find({ owner: req.user._id }).select('_id').lean();
  const myCompanyIds = myCompanies.map((c) => c._id);
  const jobs = await Job.find({
    $or: [
      { postedBy: req.user._id },
      ...(myCompanyIds.length ? [{ companyId: { $in: myCompanyIds } }] : []),
    ],
  }).select('_id title company status createdAt').sort({ createdAt: -1 }).lean();
  const jobIds = jobs.map((j) => j._id);
  const byId = new Map(jobs.map((j) => [String(j._id), j]));
  const buckets = jobs.map((j) => ({
    jobId: j._id, title: j.title, company: j.company, status: j.status,
    counts: { applied: 0, reviewing: 0, interview: 0, offer: 0, rejected: 0 },
    total: 0,
  }));
  const bucketById = new Map(buckets.map((b) => [String(b.jobId), b]));
  let recent = [];
  if (jobIds.length) {
    const [counts, latest] = await Promise.all([
      Application.aggregate([
        { $match: { job: { $in: jobIds } } },
        { $group: { _id: { job: '$job', status: '$status' }, n: { $sum: 1 } } },
      ]),
      Application.find({ job: { $in: jobIds } })
        .populate('applicant', 'name title')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);
    for (const c of counts) {
      const b = bucketById.get(String(c._id.job));
      if (b && b.counts[c._id.status] !== undefined) {
        b.counts[c._id.status] = c.n;
        b.total += c.n;
      }
    }
    recent = latest.map((a) => ({
      id: a._id,
      jobId: a.job,
      jobTitle: byId.get(String(a.job))?.title || 'Role',
      applicantName: a.applicant?.name || 'Applicant',
      applicantTitle: a.applicant?.title || '',
      status: a.status,
      createdAt: a.createdAt,
    }));
  }
  const total = buckets.reduce((s, b) => s + b.total, 0);
  const fresh = buckets.reduce((s, b) => s + b.counts.applied, 0);
  res.json({
    totals: {
      jobs: jobs.length,
      activeJobs: jobs.filter((j) => j.status === 'open').length,
      total,
      new: fresh,
    },
    perJob: buckets,
    recent,
  });
});

// GET /api/applications/mine (jobseeker)
// The employer-internal mark is stripped — seekers never see their rating.
export const myApplications = asyncHandler(async (req, res) => {
  const items = await Application.find({ applicant: req.user._id })
    .select('-mark')
    .populate('job', 'title company location salary status')
    .sort({ createdAt: -1 });
  res.json(items);
});

// GET /api/applications/job/:jobId (job owner, company manager, or admin)
export const jobApplicants = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.jobId)) {
    res.status(404);
    throw new Error('Job not found');
  }
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  if (!(await canManageJob(req.user, job))) {
    res.status(403);
    throw new Error('Not your job');
  }
  const items = await Application.find({ job: job._id })
    .populate('applicant', 'name email title location country state city skills bio phone resumeUrl portfolioUrl linkedinUrl githubUrl experienceYears experienceLevel openToWork desiredRoles jobTypes workModes desiredLocation availability educationDegree educationInstitution graduationYear')
    .sort({ createdAt: -1 });
  res.json(items);
});

// PATCH /api/applications/:id { status?, mark? } (job owner, company manager, or admin)
// At least one of status/mark is required. mark is the employer-internal
// rating and is never exposed to seekers (myApplications strips it below).
export const setStatus = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }
  if (!isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Application not found');
  }
  const app = await Application.findById(req.params.id).populate('job');
  if (!app) {
    res.status(404);
    throw new Error('Application not found');
  }
  if (!app.job || !(await canManageJob(req.user, app.job))) {
    res.status(403);
    throw new Error('Not your job');
  }
  const hasStatus = req.body.status !== undefined;
  const hasMark = req.body.mark !== undefined;
  if (!hasStatus && !hasMark) {
    res.status(400);
    throw new Error('Nothing to update — send status and/or mark');
  }
  if (hasStatus) app.status = req.body.status;
  if (hasMark) app.mark = req.body.mark;
  await app.save();
  if (hasStatus) {
    try {
      const { notifyStatusChanged } = await import('../lib/notify.js');
      notifyStatusChanged({ applicantId: app.applicant, job: app.job, status: app.status, applicationId: app._id }).catch(() => {});
    } catch { /* best-effort */ }
  }
  res.json(app);
});
