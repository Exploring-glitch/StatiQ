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
  uploadAvatar: async (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    const res = await fetch(`${BASE}/auth/avatar`, {
      method: 'POST',
      headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Upload failed (${res.status})`);
    return data;
  },
  deleteAvatar: async () => {
    const res = await fetch(`${BASE}/auth/avatar`, {
      method: 'DELETE',
      headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Delete failed (${res.status})`);
    return data;
  },
  // Private résumé download — fetches via the authed endpoint and returns
  // an object URL. External https:// links resolve directly (no auth needed).
  downloadResume: async (resumeUrl) => {
    if (!resumeUrl) throw new Error('No résumé to open');
    if (/^https?:\/\//i.test(resumeUrl)) return { direct: resumeUrl };
    const name = String(resumeUrl.split('/').pop() || '');
    const res = await fetch(`${BASE}/auth/files/resumes/${encodeURIComponent(name)}`, {
      headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Download failed (${res.status})`);
    }
    const blob = await res.blob();
    return { blobUrl: URL.createObjectURL(blob), filename: name };
  },
  jobs: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString();
    return request(`/jobs${qs ? `?${qs}` : ''}`);
  },
  job: (id) => request(`/jobs/${id}`),
  createJob: (payload) => request('/jobs', { method: 'POST', body: payload }),
  updateJob: (id, payload) => request(`/jobs/${id}`, { method: 'PUT', body: payload }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),
  apply: (jobId, coverNote = '') => request('/applications', { method: 'POST', body: { jobId, coverNote } }),
  getSavedJobs: () => request('/auth/me/saved'),
  saveJobs: (jobIds) => request('/auth/me/saved', { method: 'PUT', body: { jobIds } }),
  myApplications: () => request('/applications/mine'),
  companies: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString();
    return request(`/companies${qs ? `?${qs}` : ''}`);
  },
  company: (slug) => request(`/companies/${encodeURIComponent(slug)}`),
  myCompany: () => request('/companies/me'),
  saveCompany: (payload) => request('/companies/me', { method: 'PUT', body: payload }),
  uploadCompanyLogo: async (file) => {
    const fd = new FormData();
    fd.append('logo', file);
    const res = await fetch(`${BASE}/companies/me/logo`, {
      method: 'POST',
      headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Upload failed (${res.status})`);
    return data;
  },
  myPostedJobs: () => request('/jobs/mine/posted'),
  jobApplicants: (jobId) => request(`/applications/job/${jobId}`),
  setApplicantStatus: (appId, status) => request(`/applications/${appId}`, { method: 'PATCH', body: { status } }),
  setApplicantMark: (appId, mark) => request(`/applications/${appId}`, { method: 'PATCH', body: { mark } }),
  listNotifications: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString();
    return request(`/notifications${qs ? `?${qs}` : ''}`);
  },
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
};
