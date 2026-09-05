import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const jobs = [
  { id: 1, company: 'Zipline', role: 'Senior Software Engineer, Autonomy', location: 'South San Francisco', salary: '$180K – $240K' },
  { id: 2, company: 'Lovable', role: 'Founding Product Designer', location: 'Remote', salary: '$150K – $190K' },
  { id: 3, company: 'Chime', role: 'Senior Backend Engineer', location: 'New York', salary: '$180K – $240K' },
];

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'StatiQ API' }));
app.get('/api/jobs', (req, res) => res.json(jobs));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StatiQ API running on :${PORT}`));
