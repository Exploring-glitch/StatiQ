import { jobs as mockJobs } from '../data/mock';

const MULT = { K: 1e3, M: 1e6, L: 1e5 };

// Mirror of server/models/Job.js parseSalaryRange for demo-data filtering.
export function parseSalaryRange(str) {
  if (!str || typeof str !== 'string') return { min: null, max: null };
  const nums = [];
  const re = /([\d,.]+)\s*([KkMmLl])?/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    const n = parseFloat(m[1].replace(/,/g, ''));
    if (Number.isNaN(n)) continue;
    const val = n * (m[2] ? MULT[m[2].toUpperCase()] : 1);
    if (val < 1000) continue;
    nums.push(val);
  }
  if (!nums.length) return { min: null, max: null };
  nums.sort((a, b) => a - b);
  return { min: nums[0], max: nums[nums.length - 1] };
}

function deriveWorkMode(j) {
  if (j.workMode) return j.workMode;
  if (j.remote) return 'Remote';
  const hay = `${j.meta || ''} ${j.location || ''} ${(j.tags || []).join(' ')}`;
  if (/remote/i.test(hay)) return 'Remote';
  if (/hybrid/i.test(hay)) return 'Hybrid';
  return 'On-site';
}

// API job → card shape used across pages
export function normalizeJob(j) {
  const id = j._id || j.id;
  const range = j.salaryMin != null || j.salaryMax != null
    ? { min: j.salaryMin ?? null, max: j.salaryMax ?? null }
    : parseSalaryRange(j.salary);
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
    salaryMin: range.min,
    salaryMax: range.max,
    workMode: deriveWorkMode(j),
    experienceLevel: j.experienceLevel || '',
  };
}

// Legacy signature still supported: filterMock(q, remoteOnly)
export function filterMock(qOrFilters, remoteOnly = false) {
  const f = typeof qOrFilters === 'string'
    ? { q: qOrFilters, remoteOnly }
    : (qOrFilters || {});
  const {
    q = '', location = '', workModes = [], types = [],
    minSalary = '', experienceLevel = '', sort = 'newest',
    remoteOnly: ro = false,
  } = f;

  const needle = String(q).trim().toLowerCase();
  const loc = String(location).trim().toLowerCase();
  const min = Number(minSalary);
  const modes = [...workModes, ...(ro || remoteOnly ? ['Remote'] : [])];

  const out = mockJobs
    .map(normalizeJob)
    .filter((j) => {
      if (needle && !`${j.role} ${j.company} ${j.location} ${(j.tags || []).join(' ')}`.toLowerCase().includes(needle)) return false;
      if (loc && !(j.location || '').toLowerCase().includes(loc)) return false;
      if (modes.length && !modes.includes(j.workMode)) return false;
      if (types.length && !types.includes(j.type)) return false;
      if (experienceLevel && j.experienceLevel && j.experienceLevel !== experienceLevel) return false;
      if (minSalary !== '' && !Number.isNaN(min) && j.salaryMax != null && j.salaryMax < min) return false;
      return true;
    });

  if (sort === 'salary') out.sort((a, b) => (b.salaryMax ?? -1) - (a.salaryMax ?? -1));
  return out;
}
