// Tiny API client wired to VITE_API_URL. Token persisted in localStorage.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ORIGIN = BASE.replace(/\/api\/?$/, '');

// Stored résumé paths look like "/uploads/resume-<id>-<ts>.pdf" (relative to
// the API origin) or legacy absolute https:// URLs. Resolve to a clickable URL.
export const fileUrl = (p) => {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith('/')) return `${ORIGIN}${p}`;
  return p;
};

const getToken = () => localStorage.getItem('statiq_token');
export const setToken = (t) => (t ? localStorage.setItem('statiq_token', t) : localStorage.removeItem('statiq_token'));

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  health: () => request('/health'),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/me', { method: 'PUT', body: payload }),
  uploadResume: async (file) => {
    const fd = new FormData();
    fd.append('resume', file);
    const res = await fetch(`${BASE}/auth/resume`, {
      method: 'POST',
      headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Upload failed (${res.status})`);
    return data;
  },
  deleteResume: async () => {
    const res = await fetch(`${BASE}/auth/resume`, {
      method: 'DELETE',
      headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Delete failed (${res.status})`);
    return data;
  },
  jobs: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString();
    return request(`/jobs${qs ? `?${qs}` : ''}`);
  },
  job: (id) => request(`/jobs/${id}`),
  createJob: (payload) => request('/jobs', { method: 'POST', body: payload }),
  apply: (jobId, coverNote = '') => request('/applications', { method: 'POST', body: { jobId, coverNote } }),
  myApplications: () => request('/applications/mine'),
  myPostedJobs: () => request('/jobs/mine/posted'),
  jobApplicants: (jobId) => request(`/applications/job/${jobId}`),
  setApplicantStatus: (appId, status) => request(`/applications/${appId}`, { method: 'PATCH', body: { status } }),
};
