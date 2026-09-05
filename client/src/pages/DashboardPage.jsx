import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function DashboardPage() {
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const mine = await api.myPostedJobs();
        const list = Array.isArray(mine) ? mine : mine.items || [];
        setJobs(list);
        const entries = await Promise.all(
          list.map(async (j) => {
            try {
              const apps = await api.jobApplicants(j._id || j.id);
              return [j._id || j.id, apps.length];
            } catch {
              return [j._id || j.id, 0];
            }
          })
        );
        setCounts(Object.fromEntries(entries));
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalApps = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Employer dashboard</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Hiring overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-surface p-5">
          <p className="text-2xl font-extrabold text-white">{jobs.length}</p>
          <p className="text-xs text-slate-400">Open roles</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface p-5">
          <p className="text-2xl font-extrabold text-white">{totalApps}</p>
          <p className="text-xs text-slate-400">Total applicants</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface p-5">
          <Link to="/post-job" className="text-sm font-semibold text-accent">+ Post a new job →</Link>
          <p className="mt-1 text-xs text-slate-400">Free, takes a minute</p>
        </div>
      </div>
      <h2 className="mt-10 text-xl font-bold text-white">Your roles</h2>
      {loading && <p className="mt-4 text-sm text-slate-400">Loading…</p>}
      {!loading && jobs.length === 0 && (
        <p className="mt-4 rounded-xl border border-white/10 bg-surface p-6 text-sm text-slate-400">
          No roles yet. <Link to="/post-job" className="text-accent">Post your first job →</Link>
        </p>
      )}
      <div className="mt-4 space-y-3">
        {jobs.map((j) => {
          const id = j._id || j.id;
          return (
            <div key={id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-surface p-4">
              <div>
                <p className="text-sm font-bold text-white">{j.title}</p>
                <p className="text-xs text-slate-400">{j.location} · {counts[id] ?? '…'} applicants</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/jobs/${id}`} className="rounded-md border border-white/15 px-3 py-1 text-xs text-white">View</Link>
                <Link to={`/jobs/${id}/applicants`} className="rounded-md bg-accent px-3 py-1 text-xs font-semibold text-base hover:bg-accentHover">
                  Applicants →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
