import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import Job from './models/Job.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '1mb' }));

// Uploaded résumés live on disk under /uploads and are served publicly
// (filenames are unguessable: resume-<userId>-<timestamp>.<ext>).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/jobs', async (req, res, next) => {
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
