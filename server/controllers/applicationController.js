import { body, validationResult } from 'express-validator';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { asyncHandler } from '../middleware/auth.js';
import { isValidObjectId } from '../lib/validate.js';

export const applyRules = [
  body('jobId').isMongoId().withMessage('Invalid job id'),
  body('coverNote').trim().isLength({ min: 50, max: 2000 }).withMessage('Tell the company why you want to join (50–2000 characters)'),
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

// GET /api/applications/mine (jobseeker)
// The employer-internal mark is stripped — seekers never see their rating.
export const myApplications = asyncHandler(async (req, res) => {
  const items = await Application.find({ applicant: req.user._id })
    .select('-mark')
    .populate('job', 'title company location salary status')
    .sort({ createdAt: -1 });
  res.json(items);
});

// GET /api/applications/job/:jobId (job owner or admin sees applicants)
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
  const isOwner = job.postedBy?.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not your job');
  }
  const items = await Application.find({ job: job._id })
    .populate('applicant', 'name email title location skills bio phone resumeUrl portfolioUrl linkedinUrl githubUrl experienceYears experienceLevel openToWork desiredRoles jobTypes workModes desiredLocation availability educationDegree educationInstitution graduationYear')
    .sort({ createdAt: -1 });
  res.json(items);
});

// PATCH /api/applications/:id { status?, mark? } (job owner or admin)
// At least one of status/mark is required. mark is the employer-internal
// rating and is never exposed to seekers (myApplications strips it below).
export const setStatus = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error('Application not found');
  }
  const app = await Application.findById(req.params.id).populate('job');
  if (!app) {
    res.status(404);
    throw new Error('Application not found');
  }
  const isOwner = app.job.postedBy?.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not your job');
  }
  const hasStatus = req.body.status !== undefined;
  const hasMark = req.body.mark !== undefined;
  if (!hasStatus && !hasMark) {
    res.status(400);
    throw new Error('Nothing to update — send status and/or mark');
  }
  const allowed = ['applied', 'reviewing', 'interview', 'offer', 'rejected'];
  if (hasStatus && !allowed.includes(req.body.status)) {
    res.status(400);
    throw new Error('Invalid status');
  }
  const allowedMarks = ['', 'best', 'good', 'maybe', 'not-good'];
  if (hasMark && !allowedMarks.includes(req.body.mark)) {
    res.status(400);
    throw new Error('Invalid mark');
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
