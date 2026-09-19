// Seeds demo jobs. Usage: npm run seed [-- --confirm]  (requires MONGODB_URI in .env)
// Safe by default: refuses to wipe a non-empty collection without --confirm.
import 'dotenv/config';
import mongoose from 'mongoose';
import Job from './models/Job.js';

const jobs = [
  { title: 'Senior Software Engineer, Autonomy', company: 'Zipline', location: 'South San Francisco', salary: '$180K – $240K', salaryMin: 180000, salaryMax: 240000, type: 'Full-time', remote: false, workMode: 'On-site', experienceLevel: 'senior', status: 'open', tags: ['Robotics', 'Growing fast'], description: 'Own autonomy features end-to-end.', responsibilities: ['Own autonomy stack features', 'Build reliable robotics systems'] },
  { title: 'Founding Product Designer', company: 'Lovable', location: 'Remote', salary: '$150K – $190K', salaryMin: 150000, salaryMax: 190000, type: 'Full-time', remote: true, workMode: 'Remote', experienceLevel: 'senior', status: 'open', tags: ['AI', 'Remote friendly'], description: 'Own design zero to one.', responsibilities: ['Own design end-to-end', 'Prototype with AI tooling'] },
  { title: 'Senior Backend Engineer', company: 'Chime', location: 'New York', salary: '$180K – $240K', salaryMin: 180000, salaryMax: 240000, type: 'Full-time', remote: false, workMode: 'On-site', experienceLevel: 'senior', status: 'open', tags: ['Fintech', 'Scale-up'], description: 'Scale backend APIs.', responsibilities: ['Scale APIs to millions', 'Mentor engineers'] },
  { title: 'Frontend Engineer, React', company: 'Brex', location: 'San Francisco', salary: '$160K – $210K', salaryMin: 160000, salaryMax: 210000, type: 'Full-time', remote: false, workMode: 'On-site', experienceLevel: 'mid', status: 'open', tags: ['Fintech'], description: 'Build React dashboards.', responsibilities: ['Build React dashboards', 'Ship weekly'] },
  { title: 'Product Manager, Growth', company: 'Postman', location: 'Remote', salary: '$140K – $180K', salaryMin: 140000, salaryMax: 180000, type: 'Full-time', remote: true, workMode: 'Remote', experienceLevel: 'mid', status: 'open', tags: ['DevTools'], description: 'Own growth experiments.', responsibilities: ['Run experiments', 'Work with engineering'] },
];

try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing in server/.env');
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await Job.countDocuments();
  if (existing > 0 && !process.argv.includes('--confirm')) {
    console.log(`Seed skipped: ${existing} jobs already exist. Re-run with "-- --confirm" to replace.`);
  } else {
    if (existing > 0) await Job.deleteMany({});
    await Job.insertMany(jobs);
    console.log(`Seeded ${jobs.length} jobs`);
  }
} catch (err) {
  console.error(`Seed failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
