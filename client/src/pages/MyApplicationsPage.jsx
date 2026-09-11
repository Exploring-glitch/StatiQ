import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const STAGE = { applied: 'text-neutral-400', reviewing: 'text-yellow-400', interview: 'text-accent', offer: 'text-emerald-400', rejected: 'text-red-400' };

export default function MyApplicationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.myApplications()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Job seeker</p>
      <h1 className="mt-2 text-3xl font-bold text-white">My applications</h1>
      {loading && <p className="mt-6 text-sm text-neutral-400">Loading…</p>}
      {error && <p className="mt-6 rounded-md bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="mt-6 rounded-xl border border-white/10 bg-panel p-6 text-sm text-neutral-400">
          No applications yet. <Link to="/jobs" className="text-accent">Browse jobs →</Link>
        </p>
      )}
      <div className="mt-6 space-y-3">
        {items.map((a) => (
          <div key={a._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-panel p-4">
            <div>
              <p className="text-sm font-bold text-white">{a.job?.title}</p>
              <p className="text-xs text-neutral-400">{a.job?.company} · {a.job?.location}</p>
            </div>
            <span className={`rounded-full border border-white/10 px-3 py-1 text-xs font-semibold ${STAGE[a.status] || ''}`}>
              {a.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
