import { jobs as mockJobs } from '../data/mock';

// API job → card shape used across pages
export function normalizeJob(j) {
  const id = j._id || j.id;
  return {
    ...j,
    id,
    logo: j.logo || (j.company || '?').charAt(0).toUpperCase(),
    status: j.status === 'closed' ? 'Closed' : j.status || 'Actively hiring',
    role: j.role || j.title,
    meta: j.meta || [j.location, j.salary, j.type].filter(Boolean).join(' · '),
    tagline: j.tagline || [j.type, j.remote ? 'Remote' : j.location].filter(Boolean).join(' · '),
    tags: j.tags?.length ? j.tags : [j.type, j.remote ? 'Remote friendly' : 'On-site'].filter(Boolean),
    note: j.note || 'Posted on StatiQ',
    responsibilities: j.responsibilities || [],
    description: j.description || '',
  };
}

export function filterMock(q, remoteOnly) {
  const needle = q.trim().toLowerCase();
  return mockJobs
    .filter((j) => (!remoteOnly || /remote/i.test(j.meta)) && (!needle || `${j.role} ${j.company}`.toLowerCase().includes(needle)))
    .map(normalizeJob);
}
