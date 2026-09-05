// Seeds demo jobs. Usage: npm run seed  (requires MONGODB_URI in .env)
import 'dotenv/config';
import mongoose from 'mongoose';
import Job from './models/Job.js';

const jobs = [
  { title: 'Senior Software Engineer, Autonomy', company: 'Zipline', location: 'South San Francisco', salary: '$180K – $240K', type: 'Full-time', remote: false, tags: ['Robotics', 'Growing fast'], description: 'Own autonomy features end-to-end.', responsibilities: ['Own autonomy stack features', 'Build reliable robotics systems'] },
  { title: 'Founding Product Designer', company: 'Lovable', location: 'Remote', salary: '$150K – $190K', type: 'Full-time', remote: true, tags: ['AI', 'Remote friendly'], description: 'Own design zero to one.', responsibilities: ['Own design end-to-end', 'Prototype with AI tooling'] },
  { title: 'Senior Backend Engineer', company: 'Chime', location: 'New York', salary: '$180K – $240K', type: 'Full-time', remote: false, tags: ['Fintech', 'Scale-up'], description: 'Scale backend APIs.', responsibilities: ['Scale APIs to millions', 'Mentor engineers'] },
  { title: 'Frontend Engineer, React', company: 'Brex', location: 'San Francisco', salary: '$160K – $210K', type: 'Full-time', remote: false, tags: ['Fintech'], description: 'Build React dashboards.', responsibilities: ['Build React dashboards', 'Ship weekly'] },
  { title: 'Product Manager, Growth', company: 'Postman', location: 'Remote', salary: '$140K – $180K', type: 'Full-time', remote: true, tags: ['DevTools'], description: 'Own growth experiments.', responsibilities: ['Run experiments', 'Work with engineering'] },
];

await mongoose.connect(process.env.MONGODB_URI);
await Job.deleteMany({});
await Job.insertMany(jobs);
console.log(`Seeded ${jobs.length} jobs`);
await mongoose.disconnect();
