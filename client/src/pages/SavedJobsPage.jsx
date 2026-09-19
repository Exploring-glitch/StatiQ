import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { normalizeJob } from '../lib/jobs';
import { getSavedIds, toggleSaved, mergeSavedOnAuth } from '../lib/saved';
import { jobs as mockJobs } from '../data/mock';

export default function SavedJobsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(0);
  const [error, setError] = useState('');
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        // Pull server bookmarks first so all devices agree, then resolve.
        await mergeSavedOnAuth().catch(() => {});
        const ids = getSavedIds();
        if (!alive || ids.length === 0) {
          return;
        }
        // Bounded parallelism: much faster than one-at-a-time without
        // hammering the API with an unbounded fan-out.
        const LIMIT = 6;
        const found = [];
        let missing = 0;
        for (let i = 0; i < ids.length; i += LIMIT) {
          const batch = await Promise.all(
            ids.slice(i, i + LIMIT).map(async (id) => {
              try {
                return { ok: true, job: normalizeJob(await api.job(id)) };
              } catch {
                const m = mockJobs.find((j) => String(j.id) === String(id));
                return m ? { ok: true, job: normalizeJob(m) } : { ok: false };
              }
            })
          );
          for (const r of batch) {
            if (r.ok) found.push(r.job);
            else missing += 1;
          }
        }
        if (!alive) return;
        setItems(found);
        setUnavailable(missing);
      } catch (e) {
        if (alive) setError(e.message || 'Could not load saved jobs');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [nonce]);

  const unsave = (id) => {
    toggleSaved(id);
    setItems((prev) => prev.filter((j) => String(j.id) !== String(id)));
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Job seeker</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Saved jobs</h1>
      {loading && <p className="mt-6 text-sm text-neutral-400">Loading…</p>}
      {!loading && error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <p className="min-w-0 flex-1">{error}</p>
          <button type="button" onClick={() => setNonce((n) => n + 1)} className="rounded border border-red-400/40 px-2 py-0.5 text-xs hover:bg-red-500/20">Retry</button>
        </div>
      )}
      {!loading && unavailable > 0 && (
        <p className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-400">
          {unavailable} saved {unavailable === 1 ? 'job' : 'jobs'} {unavailable === 1 ? 'is' : 'are'} no longer available and{' '}
          {unavailable === 1 ? 'was' : 'were'} skipped — {unavailable === 1 ? 'it' : 'they'} may have been removed.
        </p>
      )}
      {!loading && items.length === 0 && unavailable === 0 && (
        <p className="mt-6 rounded-xl border border-white/10 bg-panel p-6 text-sm text-neutral-400">
          Nothing saved yet. <Link to="/jobs" className="text-accent">Browse jobs →</Link>
        </p>
      )}
      <div className="mt-6 space-y-3">
        {items.map((j) => (
          <div key={j.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-panel p-4">
            <div>
              <p className="text-sm font-bold text-white">{j.role}</p>
              <p className="text-xs text-neutral-400">{j.company} · {j.location} · {j.salary}</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/jobs/${j.id}`} className="rounded-md bg-[#f4f4f5] px-3 py-1 text-xs font-semibold text-black hover:bg-neutral-300">View</Link>
              <button onClick={() => unsave(j.id)} className="rounded-md border border-white/15 px-3 py-1 text-xs text-white hover:border-accent">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
