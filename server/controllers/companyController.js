import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import Company, { sanitizeCompanyHtml } from '../models/Company.js';
import Job from '../models/Job.js';
import { asyncHandler } from '../middleware/auth.js';
import { escapeRegExp, isValidObjectId } from '../lib/validate.js';
import { logosDir, verifyUploadMagic } from '../middleware/upload.js';

const check = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }
};

const personRules = (prefix) => [
  body(`${prefix}.name`).optional().trim().isLength({ max: 80 }),
  body(`${prefix}.title`).optional().trim().isLength({ max: 120 }),
  body(`${prefix}.bio`).optional().trim().isLength({ max: 2000 }),
  body(`${prefix}.photoUrl`).optional().trim().isLength({ max: 500 }),
];

export const companyWriteRules = [
  body('name').optional().trim().notEmpty().withMessage('Company name cannot be empty').isLength({ max: 120 }),
  body('logoUrl').optional().trim().isLength({ max: 500 }),
  body('tagline').optional().trim().isLength({ max: 160 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('overviewHtml').optional().isString().isLength({ max: 50000 }).withMessage('Overview too long'),
  body('employeeCount').optional({ nullable: true }).toInt().isInt({ min: 0, max: 1000000 }),
  body('companySize').optional().isIn(['', '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
  body('website').optional().trim().isLength({ max: 300 }),
  body('companyType').optional().isIn(['', 'Startup', 'SME', 'Enterprise', 'Nonprofit', 'Agency', 'Government']),
  body('industry').optional().trim().isLength({ max: 120 }),
  body('location').optional().trim().isLength({ max: 160 }),
  body('foundedYear').optional({ nullable: true }).toInt().isInt({ min: 1800, max: 2100 }),
  ...personRules('founder'),
  body('team').optional().isArray({ max: 50 }).withMessage('Team must be a list (max 50)'),
  body('culture.remotePolicy').optional().isIn(['', 'On-site', 'Hybrid', 'Remote-friendly', 'Remote-first']),
  body('culture.values').optional().isArray({ max: 30 }),
  body('culture.benefits').optional().isArray({ max: 50 }),
  body('culture.description').optional().trim().isLength({ max: 5000 }),
];

const cleanStrList = (v, max = 50) =>
  Array.isArray(v) ? v.map((s) => String(s ?? '').trim()).filter(Boolean).slice(0, max) : undefined;

const cleanTeam = (v) => {
  if (v === undefined) return undefined;
  if (!Array.isArray(v)) return [];
  return v.slice(0, 50).map((p) => ({
    name: String(p?.name ?? '').trim().slice(0, 80),
    title: String(p?.title ?? '').trim().slice(0, 120),
    bio: String(p?.bio ?? '').trim().slice(0, 2000),
    photoUrl: String(p?.photoUrl ?? '').trim().slice(0, 500),
  })).filter((p) => p.name || p.title || p.bio || p.photoUrl);
};

const pickCompanyFields = (src = {}) => {
  const out = {};
  for (const k of ['name', 'logoUrl', 'tagline', 'bio', 'companySize', 'website', 'companyType', 'industry', 'location']) {
    if (src[k] !== undefined) out[k] = typeof src[k] === 'string' ? src[k].trim() : src[k];
  }
  if (src.overviewHtml !== undefined) out.overviewHtml = sanitizeCompanyHtml(src.overviewHtml);
  for (const k of ['employeeCount', 'foundedYear']) {
    if (src[k] !== undefined) {
      const n = src[k] === '' || src[k] === null ? null : Number(src[k]);
      out[k] = Number.isNaN(n) ? null : n;
    }
  }
  if (src.founder !== undefined && src.founder && typeof src.founder === 'object') {
    out.founder = {
      name: String(src.founder.name ?? '').trim().slice(0, 80),
      title: String(src.founder.title ?? '').trim().slice(0, 120),
      bio: String(src.founder.bio ?? '').trim().slice(0, 2000),
      photoUrl: String(src.founder.photoUrl ?? '').trim().slice(0, 500),
    };
  }
  if (src.team !== undefined) out.team = cleanTeam(src.team);
  if (src.culture !== undefined && src.culture && typeof src.culture === 'object') {
    out.culture = {};
    if (src.culture.remotePolicy !== undefined) out.culture.remotePolicy = src.culture.remotePolicy;
    if (src.culture.values !== undefined) out.culture.values = cleanStrList(src.culture.values, 30) ?? [];
    if (src.culture.benefits !== undefined) out.culture.benefits = cleanStrList(src.culture.benefits, 50) ?? [];
    if (src.culture.description !== undefined) {
      out.culture.description = String(src.culture.description ?? '').trim().slice(0, 5000);
    }
  }
  return out;
};

// Match jobs for a company by slug (new) or exact name (legacy rows).
async function companyJobs(company) {
  const ors = [];
  if (company.slug) ors.push({ companySlug: company.slug });
  if (company.name) ors.push({ company: new RegExp(`^${escapeRegExp(company.name)}$`, 'i') });
  if (!ors.length) return [];
  return Job.find({ status: 'open', $or: ors }).sort({ createdAt: -1 }).limit(100).lean();
}

// GET /api/companies?q=&page=&limit= — public search for seekers
export const listCompanies = asyncHandler(async (req, res) => {
  const { q = '', page = 1, limit = 12 } = req.query;
  const filter = q ? { $text: { $search: String(q) } } : {};
  const lim = Math.min(50, Math.max(1, Number(limit) || 12));
  const skip = (Math.max(1, Number(page)) - 1) * lim;
  const [items, total] = await Promise.all([
    Company.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(lim).lean(),
    Company.countDocuments(filter),
  ]);
  // Attach live open-job counts without N+1 on the client.
  const counts = await Promise.all(
    items.map(async (c) => ({ id: String(c._id), n: (await companyJobs(c)).length }))
  );
  const byId = new Map(counts.map((x) => [x.id, x.n]));
  res.json({
    items: items.map((c) => ({ ...c, id: c._id, jobsCount: byId.get(String(c._id)) ?? 0 })),
    total,
    page: Number(page),
    pages: Math.ceil(total / lim) || 1,
  });
});

// GET /api/companies/me — employer's own profile draft
export const getMyCompany = asyncHandler(async (req, res) => {
  const mine = await Company.findOne({ owner: req.user._id }).lean();
  if (!mine) return res.json(null);
  const jobs = await companyJobs(mine);
  res.json({ ...mine, id: mine._id, jobsCount: jobs.length });
});

// PUT /api/companies/me — employer create-or-update own profile
export const upsertMyCompany = asyncHandler(async (req, res) => {
  check(req, res);
  const patch = pickCompanyFields(req.body);
  if (!patch.name) {
    const existing = await Company.findOne({ owner: req.user._id });
    if (!existing) {
      res.status(400);
      throw new Error('Company name is required');
    }
  }
  const updated = await Company.findOneAndUpdate(
    { owner: req.user._id },
    { $set: { ...patch, owner: req.user._id } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  const jobs = await companyJobs(updated.toObject());
  const obj = updated.toObject();
  res.json({ ...obj, id: obj._id, jobsCount: jobs.length });
});

// POST /api/companies/me/logo (employer, multipart field: "logo")
export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file received — attach it as the "logo" field');
  }
  const ext = path.extname(req.file.originalname).toLowerCase();
  const bad = verifyUploadMagic(req.file.path, ext);
  if (bad) {
    fs.unlink(req.file.path, () => {});
    res.status(400);
    throw new Error(bad);
  }
  const url = `/uploads/logos/${req.file.filename}`;
  const updated = await Company.findOneAndUpdate(
    { owner: req.user._id },
    { $set: { logoUrl: url, owner: req.user._id } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  // Clean up any previous logo file so disk doesn't fill with orphans.
  try {
    for (const f of fs.readdirSync(logosDir)) {
      const full = path.join(logosDir, f);
      if (full !== req.file.path && f.startsWith(`logo-${req.user._id}-`)) fs.unlink(full, () => {});
    }
  } catch { /* best-effort cleanup */ }
  const obj = updated.toObject();
  res.status(201).json({ ...obj, id: obj._id, logoUrl: url });
});

// GET /api/companies/:slug — public profile + jobs for seekers
export const getCompany = asyncHandler(async (req, res) => {
  const key = String(req.params.slug || '');
  const query = isValidObjectId(key) ? { $or: [{ _id: key }, { slug: key }] } : { slug: key };
  const company = await Company.findOne(query).lean();
  if (!company) {
    res.status(404);
    throw new Error('Company not found');
  }
  const jobs = await companyJobs(company);
  res.json({ ...company, id: company._id, jobs, jobsCount: jobs.length });
});
