import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { normalizeJob } from '../lib/jobs';
import { getSavedIds, toggleSaved } from '../lib/saved';
import { jobs as mockJobs } from '../data/mock';

export default function SavedJobsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const ids = getSavedIds();
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      const found = [];
      for (const id of ids) {
        try {
          found.push(normalizeJob(await api.job(id)));
        } catch {
          const m = mockJobs.find((j) => String(j.id) === String(id));
          if (m) found.push(normalizeJob(m));
        }
      }
      setItems(found);
      setLoading(false);
    };
    load();
  }, []);

  const unsave = (id) => {
    toggleSaved(id);
    setItems(items.filter((j) => String(j.id) !== String(id)));
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Job seeker</p>
      <h1 className="mt-2 text-3xl font-bold text-neutral-900">Saved jobs</h1>
      {loading && <p className="mt-6 text-sm text-neutral-500">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="mt-6 rounded-xl border border-neutral-200 bg-[#F4F4F2] p-6 text-sm text-neutral-500">
          Nothing saved yet. <Link to="/jobs" className="text-accent">Browse jobs →</Link>
        </p>
      )}
      <div className="mt-6 space-y-3">
        {items.map((j) => (
          <div key={j.id} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-[#F4F4F2] p-4">
            <div>
              <p className="text-sm font-bold text-neutral-900">{j.role}</p>
              <p className="text-xs text-neutral-500">{j.company} · {j.location} · {j.salary}</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/jobs/${j.id}`} className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">View</Link>
              <button onClick={() => unsave(j.id)} className="rounded-md border border-neutral-300 px-3 py-1 text-xs text-neutral-900">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
