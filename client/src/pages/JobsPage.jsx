import { useMemo, useState } from 'react';
import { jobs } from '../data/mock';
import JobCard from '../components/JobCard';

export default function JobsPage() {
  const [q, setQ] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return jobs.filter((j) => {
      if (remoteOnly && !j.remote) return false;
      if (!needle) return true;
      return `${j.role} ${j.company} ${j.location}`.toLowerCase().includes(needle);
    });
  }, [q, remoteOnly]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Startup jobs</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Browse {jobs.length}+ startup roles</h1>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white placeholder:text-slate-500"
          placeholder="Search role, company, or location..."
        />
        <button
          onClick={() => setRemoteOnly(!remoteOnly)}
          className={`rounded-md border px-4 py-2 text-sm ${remoteOnly ? 'border-accent bg-accent/15 text-accent' : 'border-white/15 text-white'}`}
        >
          {remoteOnly ? 'Remote ✓' : 'Remote only'}
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">{filtered.length} roles found (UI-only demo)</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filtered.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="mt-8 rounded-xl border border-white/10 bg-surface p-6 text-center text-sm text-slate-400">
          No roles match. Try clearing search.
        </p>
      )}
    </section>
  );
}
