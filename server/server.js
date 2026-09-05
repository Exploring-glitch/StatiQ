import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import Job from './models/Job.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '1mb' }));

await connectDB();

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

app.use('/api/auth', authRoutes);
app.use('/api/jobs', async (req, res, next) => {
  // Graceful fallback: no DB yet → serve demo data for public GETs
  if (req.method === 'GET' && !Job.db?.readyState) {
    if (req.path === '/' || req.path === '') return res.json({ items: demoJobs, total: demoJobs.length, page: 1, pages: 1 });
    const id = req.path.split('/').filter(Boolean)[0]; // e.g. /2 → '2'
    const one = demoJobs.find((j) => j._id === id);
    if (one) return res.json(one);
    return res.status(503).json({ message: 'Database not configured — set MONGODB_URI in server/.env' });
  }
  next();
}, jobRoutes);
app.use('/api/applications', applicationRoutes);

app.use('/api', notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StatiQ API running on port ${PORT}`));
