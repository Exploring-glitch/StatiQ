// Seeds demo jobs + companies. Usage: npm run seed [-- --confirm]  (requires MONGODB_URI in .env)
// Safe by default: refuses to wipe a non-empty collection without --confirm.
import 'dotenv/config';
import mongoose from 'mongoose';
import Job from './models/Job.js';
import Company from './models/Company.js';

const jobs = [
  { title: 'Senior Software Engineer, Autonomy', company: 'Zipline', location: 'South San Francisco', salary: '$180K – $240K', salaryMin: 180000, salaryMax: 240000, type: 'Full-time', remote: false, workMode: 'On-site', experienceLevel: 'senior', status: 'open', tags: ['Robotics', 'Growing fast'], description: 'Own autonomy features end-to-end.', responsibilities: ['Own autonomy stack features', 'Build reliable robotics systems'] },
  { title: 'Founding Product Designer', company: 'Lovable', location: 'Remote', salary: '$150K – $190K', salaryMin: 150000, salaryMax: 190000, type: 'Full-time', remote: true, workMode: 'Remote', experienceLevel: 'senior', status: 'open', tags: ['AI', 'Remote friendly'], description: 'Own design zero to one.', responsibilities: ['Own design end-to-end', 'Prototype with AI tooling'] },
  { title: 'Senior Backend Engineer', company: 'Chime', location: 'New York', salary: '$180K – $240K', salaryMin: 180000, salaryMax: 240000, type: 'Full-time', remote: false, workMode: 'On-site', experienceLevel: 'senior', status: 'open', tags: ['Fintech', 'Scale-up'], description: 'Scale backend APIs.', responsibilities: ['Scale APIs to millions', 'Mentor engineers'] },
  { title: 'Frontend Engineer, React', company: 'Brex', location: 'San Francisco', salary: '$160K – $210K', salaryMin: 160000, salaryMax: 210000, type: 'Full-time', remote: false, workMode: 'On-site', experienceLevel: 'mid', status: 'open', tags: ['Fintech'], description: 'Build React dashboards.', responsibilities: ['Build React dashboards', 'Ship weekly'] },
  { title: 'Product Manager, Growth', company: 'Postman', location: 'Remote', salary: '$140K – $180K', salaryMin: 140000, salaryMax: 180000, type: 'Full-time', remote: true, workMode: 'Remote', experienceLevel: 'mid', status: 'open', tags: ['DevTools'], description: 'Own growth experiments.', responsibilities: ['Run experiments', 'Work with engineering'] },
];

const companies = [
  {
    name: 'Zipline', slug: 'zipline', tagline: 'Autonomous delivery at planetary scale',
    bio: 'Building the world’s fastest delivery network with autonomous drones.',
    overviewHtml: '<h2>We deliver where roads can’t</h2><p>Zipline designs, builds and operates autonomous drones that deliver medical supplies and goods in minutes.</p><p><br></p><p><b>Hybrid</b> teams across SF + remote · <i>mission-first</i> culture.</p>',
    employeeCount: 1200, companySize: '1000+', website: 'https://flyzipline.com', companyType: 'Startup', industry: 'Robotics', location: 'South San Francisco', foundedYear: 2014,
    founder: { name: 'Keller Rinaudo', title: 'Co-founder & CEO', bio: 'Founded Zipline to deliver medical supplies by drone.' },
    team: [
      { name: 'Keller Rinaudo', title: 'Co-founder & CEO', bio: 'Leads company vision and strategy.' },
      { name: 'Asha Patel', title: 'Head of Autonomy', bio: 'Owns the autonomy stack and flight safety.' },
    ],
    culture: { remotePolicy: 'Hybrid', values: ['Mission first', 'Move fast safely'], benefits: ['Equity', 'Health insurance', 'Flexible PTO'], description: 'Hybrid by default, remote-friendly for senior roles.' },
  },
  {
    name: 'Lovable', slug: 'lovable', tagline: 'AI software engineer in your browser',
    bio: 'Prompt-to-product platform turning ideas into full-stack apps.',
    overviewHtml: '<h2>Ship software by describing it</h2><p>Lovable is a <b>remote-first</b> team building the fastest way from idea to production app.</p>',
    employeeCount: 180, companySize: '51-200', website: 'https://lovable.dev', companyType: 'Startup', industry: 'AI / DevTools', location: 'Remote', foundedYear: 2023,
    founder: { name: 'Anton Osika', title: 'Founder & CEO', bio: 'Previously built Lovable (GPT Engineer) open-source.' },
    team: [
      { name: 'Anton Osika', title: 'Founder & CEO', bio: 'Product + AI research.' },
      { name: 'Maya Chen', title: 'Design Lead', bio: 'Owns design zero to one.' },
    ],
    culture: { remotePolicy: 'Remote-first', values: ['Craft', 'Speed', 'Trust'], benefits: ['Remote stipend', 'Equity', 'Annual offsite'], description: 'Remote-first across 20+ countries with async defaults.' },
  },
  {
    name: 'Chime', slug: 'chime', tagline: 'Banking that has your back',
    bio: 'Consumer fintech helping members get ahead financially.',
    overviewHtml: '<h2>Financial peace of mind</h2><p>Chime serves 20M+ members with fee-free banking, early payday and credit building.</p>',
    employeeCount: 1500, companySize: '1000+', website: 'https://chime.com', companyType: 'Enterprise', industry: 'Fintech', location: 'New York', foundedYear: 2013,
    founder: { name: 'Chris Britt', title: 'Co-founder & CEO', bio: 'Co-founded Chime to make banking fair.' },
    team: [
      { name: 'Chris Britt', title: 'Co-founder & CEO', bio: 'Leads Chime’s mission and growth.' },
      { name: 'Dev Rao', title: 'VP Engineering', bio: 'Scales backend APIs to millions.' },
    ],
    culture: { remotePolicy: 'Hybrid', values: ['Members first', 'Ownership'], benefits: ['Equity', '401(k)', 'Wellness stipend'], description: 'Hybrid hubs in SF/NYC with remote options.' },
  },
];

try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing in server/.env');
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await Job.countDocuments();
  if (existing > 0 && !process.argv.includes('--confirm')) {
    console.log(`Seed skipped: ${existing} jobs already exist. Re-run with "-- --confirm" to replace.`);
  } else {
    if (existing > 0) {
      await Job.deleteMany({});
      await Company.deleteMany({});
    }
    const inserted = await Job.insertMany(jobs.map((j) => ({
      ...j,
      companySlug: String(j.company).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    })));
    await Company.insertMany(companies);
    console.log(`Seeded ${inserted.length} jobs + ${companies.length} companies`);
  }
} catch (err) {
  console.error(`Seed failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
