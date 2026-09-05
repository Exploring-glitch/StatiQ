export const logos = [
  'Scale AI', 'Neuralink', 'Cognition', 'Brex', 'Lovable', 'Chime',
  'Faire', 'Postman', 'Klaviyo', 'Braze', 'Zipline', 'Astranis',
];

const desc = (company) =>
  `Join ${company} and help build what's next. You'll work directly with founders, own meaningful problems, and ship fast. We value clear communication, high ownership, and a bias for action.`;

export const jobs = [
  {
    id: 1, company: 'Zipline', logo: 'Z', status: 'Actively hiring',
    tagline: "Building the world's fastest delivery network.",
    tags: ['Robotics', 'Growing fast', 'Responds quickly'],
    role: 'Senior Software Engineer, Autonomy',
    meta: 'South San Francisco · $180K – $240K · Equity',
    location: 'South San Francisco', salary: '$180K – $240K', type: 'Full-time', remote: false,
    note: 'Recruiter recently active', description: desc('Zipline'),
    responsibilities: ['Own autonomy stack features end-to-end', 'Build reliable robotics systems', 'Work with hardware and ops teams'],
  },
  {
    id: 2, company: 'Lovable', logo: 'L', status: 'Actively hiring',
    tagline: 'Build software with a conversation · 12 open roles',
    tags: ['AI', 'Remote friendly', 'Early stage'],
    role: 'Founding Product Designer',
    meta: 'Remote · $150K – $190K · Equity',
    location: 'Remote', salary: '$150K – $190K', type: 'Full-time', remote: true,
    note: 'Founder recently active', description: desc('Lovable'),
    responsibilities: ['Own design from zero to one', 'Prototype with AI tooling', 'Talk to users weekly'],
  },
  {
    id: 3, company: 'Chime', logo: 'C', status: 'Actively hiring',
    tagline: 'Banking that has your back · 8 open roles',
    tags: ['Fintech', 'Scale-up', 'Hybrid'],
    role: 'Senior Backend Engineer',
    meta: 'New York · $180K – $240K · Equity',
    location: 'New York', salary: '$180K – $240K', type: 'Full-time', remote: false,
    note: 'Matched to you · today', description: desc('Chime'),
    responsibilities: ['Scale backend APIs to millions', 'Improve reliability and latency', 'Mentor engineers'],
  },
  {
    id: 4, company: 'Brex', logo: 'B', status: 'Actively hiring',
    tagline: 'Spend management for startups · 6 open roles',
    tags: ['Fintech', 'Scale-up'], role: 'Frontend Engineer, React',
    meta: 'San Francisco · $160K – $210K · Equity',
    location: 'San Francisco', salary: '$160K – $210K', type: 'Full-time', remote: false,
    note: 'Recruiter recently active', description: desc('Brex'),
    responsibilities: ['Build React dashboards', 'Partner with design', 'Ship weekly'],
  },
  {
    id: 5, company: 'Postman', logo: 'P', status: 'Actively hiring',
    tagline: 'API platform for developers · 9 open roles',
    tags: ['DevTools', 'Remote friendly'], role: 'Product Manager, Growth',
    meta: 'Remote · $140K – $180K · Equity',
    location: 'Remote', salary: '$140K – $180K', type: 'Full-time', remote: true,
    note: 'Founder recently active', description: desc('Postman'),
    responsibilities: ['Own growth experiments', 'Analyze funnels', 'Work with engineering'],
  },
  {
    id: 6, company: 'Faire', logo: 'F', status: 'Actively hiring',
    tagline: 'Wholesale marketplace · 5 open roles',
    tags: ['Marketplace', 'Hybrid'], role: 'Data Analyst',
    meta: 'San Francisco · $130K – $160K · Equity',
    location: 'San Francisco', salary: '$130K – $160K', type: 'Full-time', remote: false,
    note: 'Matched to you', description: desc('Faire'),
    responsibilities: ['Build dashboards', 'Run analyses', 'Advise product teams'],
  },
  {
    id: 7, company: 'Klaviyo', logo: 'K', status: 'Actively hiring',
    tagline: 'Marketing automation · 7 open roles',
    tags: ['SaaS', 'Remote friendly'], role: 'Growth Marketer',
    meta: 'Remote · $110K – $140K · Equity',
    location: 'Remote', salary: '$110K – $140K', type: 'Full-time', remote: true,
    note: 'Recruiter recently active', description: desc('Klaviyo'),
    responsibilities: ['Run paid and lifecycle campaigns', 'Own SEO experiments', 'Report on CAC/LTV'],
  },
  {
    id: 8, company: 'Braze', logo: 'B', status: 'Actively hiring',
    tagline: 'Customer engagement · 4 open roles',
    tags: ['SaaS', 'Hybrid'], role: 'UI/UX Designer',
    meta: 'New York · $130K – $165K · Equity',
    location: 'New York', salary: '$130K – $165K', type: 'Full-time', remote: false,
    note: 'Founder recently active', description: desc('Braze'),
    responsibilities: ['Design end-to-end flows', 'Maintain design system', 'Prototype quickly'],
  },
  {
    id: 9, company: 'Astranis', logo: 'A', status: 'Actively hiring',
    tagline: 'Satellites for connectivity · 3 open roles',
    tags: ['Space', 'Hardware'], role: 'Operations Manager',
    meta: 'San Francisco · $120K – $150K · Equity',
    location: 'San Francisco', salary: '$120K – $150K', type: 'Full-time', remote: false,
    note: 'Recruiter recently active', description: desc('Astranis'),
    responsibilities: ['Run launch ops', 'Coordinate vendors', 'Improve processes'],
  },
];

export const testimonials = [
  { type: 'Candidate', text: 'I got my tech job on StatiQ 4 years ago and I\u2019m still happy! Pays well, great culture, and unlimited PTO.' },
  { type: 'Recruiter', text: 'Half of the offers I give are sourced from StatiQ. It\u2019s the best product for anyone looking for startup talent.' },
  { type: 'Candidate', text: 'I love StatiQ. I got my current job entirely through the site last year. Super easy to use and I love the UI.' },
  { type: 'Recruiter', text: 'I can\u2019t imagine my day-to-day without this platform. Life would be a lot more difficult.' },
];

export const faqs = [
  { q: 'What is StatiQ?', a: 'StatiQ is the hiring marketplace for startups: post jobs for free, source with AI agents, or get done-for-you recruiting, connected to a network of opted-in candidates.' },
  { q: 'Is StatiQ free to post jobs?', a: 'Yes. Unlimited jobs, unlimited applicants, and a built-in ATS are free forever. Promoting a job for extra visibility is optional and paid.' },
  { q: 'Is StatiQ free for job seekers?', a: 'Yes. Creating a profile and applying to jobs on StatiQ is always free for candidates.' },
  { q: 'How many startups and candidates are on StatiQ?', a: '27,000+ startups hire on StatiQ, drawing on an exclusive pool of 10M+ candidates who opted in to hear from startups.' },
  { q: 'Does StatiQ offer AI recruiting software?', a: 'Yes. StatiQ Reach uses AI sourcing agents to identify and engage relevant candidates, from sourcing through selection.' },
  { q: 'Who is StatiQ for?', a: 'StatiQ is built for startups hiring at every stage, and for candidates who want to work at high-growth companies.' },
];

export const agents = [
  { name: 'NYC Senior · Backend', evaluated: 241, matched: 117, pitched: 12, replied: 3 },
  { name: 'React Focused · Remote', evaluated: 183, matched: 94, pitched: 8, replied: 2 },
  { name: 'Fintech Experience', evaluated: 117, matched: 75, pitched: 6, replied: 1 },
];
