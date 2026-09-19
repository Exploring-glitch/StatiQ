// Shared employer mark labels + badge styles. Marks are employer-internal:
// best / good / maybe / not-good ('' = not marked yet).

export const MARKS = [
  { v: '', l: 'Not marked' },
  { v: 'best', l: '⭐ Best' },
  { v: 'good', l: '👍 Good candidate' },
  { v: 'maybe', l: '🤔 Maybe' },
  { v: 'not-good', l: '👎 Not good enough' },
];

export const markLabel = (v) => MARKS.find((m) => m.v === (v || ''))?.l || 'Not marked';

export const markBadge = (v) => {
  switch (v) {
    case 'best': return 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300';
    case 'good': return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
    case 'maybe': return 'border-sky-500/40 bg-sky-500/10 text-sky-300';
    case 'not-good': return 'border-red-500/40 bg-red-500/10 text-red-300';
    default: return 'border-white/10 text-neutral-500';
  }
};
