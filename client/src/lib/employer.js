// Shared employer-panel helpers (no external deps).
// Keeps Dashboard / Jobs / Applicants copy + status styling consistent.

// Time-aware greeting for the dashboard header ("Good evening, Sreeja").
export const greetingFor = (date = new Date()) => {
  const h = date.getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// Job lifecycle meta. `draft` is employer-only (never on the public board).
export const JOB_STATUS = {
  open: { label: 'Active', badge: 'bg-emerald-500/15 text-emerald-400' },
  draft: { label: 'Draft', badge: 'bg-amber-500/15 text-amber-400' },
  closed: { label: 'Closed', badge: 'bg-red-500/15 text-red-400' },
};

export const jobStatusLabel = (s) => JOB_STATUS[s]?.label || s || '—';
export const jobStatusBadge = (s) => JOB_STATUS[s]?.badge || 'bg-white/10 text-neutral-300';

// Applicant pipeline buckets for the grouped overview.
export const APPLICANT_BUCKETS = [
  { key: 'applied', label: 'New' },
  { key: 'reviewing', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'rejected', label: 'Rejected' },
];

export const bucketCount = (counts, key) => Number(counts?.[key] ?? 0);
