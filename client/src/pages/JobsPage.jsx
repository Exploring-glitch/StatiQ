import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { normalizeJob, filterMock } from '../lib/jobs';
import JobCard from '../components/JobCard';

export default function JobsPage() {
  const [q, setQ] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [items, setItems] = useState([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await api.jobs({ q, remote: remoteOnly ? 'true' : '' });
        if (!alive) return;
        const list = (data.items || data).map(normalizeJob);
        setItems(list);
        setLive(true);
      } catch {
        if (!alive) return;
        setItems(filterMock(q, remoteOnly));
        setLive(false);
      } finally {
        if (alive) setLoading(false);
      }
    }, 300); // debounce search
    return () => { alive = false; clearTimeout(t); };
  }, [q, remoteOnly]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Startup jobs</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Browse startup roles</h1>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-panel px-3 py-2 text-sm text-white placeholder:text-neutral-500"
          placeholder="Search role, company, or location..."
        />
        <button
          onClick={() => setRemoteOnly(!remoteOnly)}
          className={`rounded-md border px-4 py-2 text-sm ${remoteOnly ? 'border-accent bg-accent/15 text-accent' : 'border-white/15 text-white hover:border-accent'}`}
        >
          {remoteOnly ? 'Remote ✓' : 'Remote only'}
        </button>
      </div>
      <p className="mt-3 text-xs text-neutral-500">
        {loading ? 'Loading…' : `${items.length} roles found`} ·{' '}
        <span className={live ? 'text-accent' : 'text-neutral-500'}>{live ? '● Live from API' : '○ Demo data (API offline)'}</span>
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </div>
      {!loading && items.length === 0 && (
        <p className="mt-8 rounded-xl border border-white/10 bg-panel p-6 text-center text-sm text-neutral-400">
          No roles match. Try clearing search.
        </p>
      )}
    </section>
  );
}
