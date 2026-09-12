import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { asyncHandler } from '../middleware/auth.js';
import { isValidObjectId } from '../lib/validate.js';

// POST /api/applications { jobId, coverNote } (jobseeker)
export const apply = asyncHandler(async (req, res) => {
  const { jobId, coverNote = '' } = req.body;
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
export const myApplications = asyncHandler(async (req, res) => {
  const items = await Application.find({ applicant: req.user._id })
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

// PATCH /api/applications/:id { status } (job owner or admin)
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
  const allowed = ['applied', 'reviewing', 'interview', 'offer', 'rejected'];
  if (!allowed.includes(req.body.status)) {
    res.status(400);
    throw new Error('Invalid status');
  }
  app.status = req.body.status;
  await app.save();
  res.json(app);
});
