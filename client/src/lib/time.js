import { useEffect, useState } from 'react';

// Shared relative-time helpers so every "x ago" label ticks the same way.
// Prefix keeps labels contextual: timeAgo(ts, 'Applied') -> "Applied 1d ago".

export function timeAgo(iso, prefix = '', nowMs = Date.now()) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = nowMs - t;
  if (diff < 0) return prefix ? `${prefix} just now` : 'just now';
  const mins = Math.floor(diff / 60000);
  const label =
    mins < 1 ? 'just now' :
    mins < 60 ? `${mins}m ago` :
    mins < 60 * 24 ? `${Math.floor(mins / 60)}h ago` :
    mins < 60 * 24 * 30 ? `${Math.floor(mins / (60 * 24))}d ago` :
    new Date(iso).toLocaleDateString();
  if (!prefix) return label;
  return label === 'just now' ? `${prefix} just now` : `${prefix} ${label}`;
}

// Re-renders the caller on an interval so "x ago" labels stay live
// without refetching. Default 30s is plenty for minute-granular labels.
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
