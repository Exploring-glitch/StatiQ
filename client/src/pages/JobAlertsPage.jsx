import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';

const toJobsLink = (q = {}) => {
  const params = new URLSearchParams();
  if (q.q) params.set('q', q.q);
  if (q.location) params.set('location', q.location);
  if (q.type) params.set('type', q.type);
  if (q.workMode) params.set('mode', q.workMode);
  if (q.experienceLevel) params.set('level', q.experienceLevel);
  if (q.minSalary) params.set('min', q.minSalary);
  if (q.sort && q.sort !== 'newest') params.set('sort', q.sort);
  const qs = params.toString();
  return `/jobs${qs ? `?${qs}` : ''}`;
};

export default function JobAlertsPage() {
  const toast = useToast();
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await api.listAlerts());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (a) => {
    const id = a._id || a.id;
    setItems((prev) => prev.map((x) => ((x._id || x.id) === id ? { ...x, isActive: !x.isActive } : x)));
    try {
      await api.updateAlert(id, { isActive: !a.isActive });
    } catch (e) {
      toast?.notify(e.message, 'error');
      load();
    }
  };

  const remove = async (a) => {
    const id = a._id || a.id;
    if (!window.confirm(`Delete alert “${a.name}”?`)) return;
    setItems((prev) => prev.filter((x) => (x._id || x.id) !== id));
    try {
      await api.deleteAlert(id);
      toast?.notify('Alert deleted', 'success');
    } catch (e) {
      toast?.notify(e.message, 'error');
      load();
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Job seeker</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-white">Job alerts</h1>
        <Link to="/jobs" className="rounded-md bg-[#f4f4f5] px-3 py-1.5 text-xs font-semibold text-black hover:bg-neutral-300">
          + New from search →
        </Link>
      </div>
      <p className="mt-1 text-sm text-neutral-400">Max 10 alerts. Instant alerts notify you when an employer posts a match.</p>
      {loading && <p className="mt-6 text-sm text-neutral-400">Loading…</p>}
      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-400">
          <p className="min-w-0 flex-1">{error}</p>
          <button type="button" onClick={load} className="rounded border border-red-400/40 px-2 py-0.5 text-xs">Retry</button>
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="mt-6 rounded-xl border border-white/10 bg-panel p-6 text-sm text-neutral-400">
          No alerts yet. <Link to="/jobs" className="text-accent">Search jobs and hit “Save search” →</Link>
        </p>
      )}
      <div className="mt-6 space-y-3">
        {items.map((a) => (
          <div key={a._id || a.id} className="rounded-xl border border-white/10 bg-panel p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-bold text-white">
                  {a.name}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-neutral-500/15 text-neutral-400'}`}>
                    {a.isActive ? 'Active' : 'Paused'}
                  </span>
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {[a.query?.q, a.query?.location, a.query?.type, a.query?.workMode].filter(Boolean).join(' · ') || 'All jobs'}
                  {a.matchCount != null && ` · ${a.matchCount} match${a.matchCount === 1 ? '' : 'es'} now`}
                </p>
              </div>
              <span className="shrink-0 text-xs text-neutral-500">{a.frequency}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => nav(toJobsLink(a.query || {}))} className="rounded-md bg-[#f4f4f5] px-3 py-1 text-xs font-semibold text-black hover:bg-neutral-300">
                Run now →
              </button>
              <button type="button" onClick={() => toggle(a)} className="rounded-md border border-white/15 px-3 py-1 text-xs text-white hover:border-accent">
                {a.isActive ? 'Pause' : 'Resume'}
              </button>
              <button type="button" onClick={() => remove(a)} className="rounded-md border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
