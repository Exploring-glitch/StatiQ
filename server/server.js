import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import Job from './models/Job.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { publicLimiter } from './middleware/rateLimit.js';
import { avatarsDir } from './middleware/upload.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked'), false);
  },
}));
app.use(express.json({ limit: '1mb' }));

// Strip NoSQL-injection keys ($..., ....) from body/query/params.
// Lightweight alternative to express-mongo-sanitize (Express 5 frozen-query
// safe: builds cleaned copies instead of mutating req.query).
const sanitizeObject = (obj) => {
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('$') || k.includes('.')) continue;
      out[k] = sanitizeObject(v);
    }
    return out;
  }
  return obj;
};
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') req.body = sanitizeObject(req.body);
  if (req.params && typeof req.params === 'object') {
    for (const [k, v] of Object.entries(sanitizeObject(req.params))) req.params[k] = v;
  }
  // Express 5 exposes req.query via a getter — never reassign it, clean keys in place.
  if (req.query && typeof req.query === 'object') {
    try {
      for (const k of Object.keys(req.query)) {
        if (k.startsWith('$') || k.includes('.')) {
          delete req.query[k];
        } else {
          req.query[k] = sanitizeObject(req.query[k]);
        }
      }
    } catch {
      // Query is frozen/unparseable — downstream allowlists still reject bad values.
    }
  }
  next();
});

// Uploads: avatars are public; résumés are PRIVATE (served only via the
// authenticated GET /api/auth/files/resumes/:name endpoint).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads/avatars', express.static(avatarsDir, { maxAge: '7d' }));
app.use('/uploads/resumes', (_req, res) =>
  res.status(403).json({ message: 'Forbidden — résumés require authentication. Use GET /api/auth/files/resumes/:name.' })
);
// Legacy flat /uploads/<file>: serve avatars, block anything resume-like.
app.use('/uploads', (req, res, next) => {
  const base = path.basename(req.path || '');
  if (/^resume-/i.test(base)) {
    return res.status(403).json({ message: 'Forbidden — résumés require authentication. Use GET /api/auth/files/resumes/:name.' });
  }
  next();
}, express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));

// Never let a DB outage kill the API: stay up in degraded mode so the
// site loads and API errors are readable JSON (not "Failed to fetch").
try {
  await connectDB();
} catch (err) {
  console.error('MongoDB unreachable — running in DEGRADED mode (browsing works, signup/login/apply disabled).');
  console.error(`DB reason: ${String(err?.message || err).split('\n')[0]}`);
  console.error('Fix: whitelist this machine IP in Atlas → Network Access, or point MONGODB_URI at a reachable database.');
}

const dbGate = (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({
    message: 'Database unavailable — the server cannot reach MongoDB right now. Browsing still works; signup, login, posting jobs and applying are paused until the database is reachable.',
  });
};

app.get('/api/health', (req, res) =>
  res.json({ ok: true, service: 'StatiQ API', db: !!Job.db?.readyState })
);

// Demo fallback so the homepage works before MONGODB_URI is set
const demoJobs = [
  { _id: '1', title: 'Senior Software Engineer, Autonomy', company: 'Zipline', location: 'South San Francisco', salary: '$180K – $240K' },
  { _id: '2', title: 'Founding Product Designer', company: 'Lovable', location: 'Remote', salary: '$150K – $190K' },
  { _id: '3', title: 'Senior Backend Engineer', company: 'Chime', location: 'New York', salary: '$180K – $240K' },
];

app.get('/api/demo-jobs', (req, res) => res.json(demoJobs));

app.use('/api/auth', dbGate, authRoutes);
app.use('/api/jobs', publicLimiter, async (req, res, next) => {
  // Graceful fallback: no DB yet → serve demo data for public GETs
  if (req.method === 'GET' && !Job.db?.readyState) {
    if (req.path === '/' || req.path === '') return res.json({ items: demoJobs, total: demoJobs.length, page: 1, pages: 1 });
    const id = req.path.split('/').filter(Boolean)[0]; // e.g. /2 → '2'
    const one = demoJobs.find((j) => j._id === id);
    if (one) return res.json(one);
    return res.status(503).json({ message: 'Database not configured — set MONGODB_URI in server/.env' });
  }
  // Mutations always need the DB; public GETs already handled above or fall to jobRoutes.
  if (req.method !== 'GET') return dbGate(req, res, next);
  next();
}, jobRoutes);
app.use('/api/applications', dbGate, applicationRoutes);

app.use('/api', notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StatiQ API running on port ${PORT}`));
