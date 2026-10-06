import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fileUrl } from '../lib/api';
import { timeAgo, useNow } from '../lib/time';
import { jobStatusBadge, jobStatusLabel } from '../lib/employer';
import { useToast } from '../components/Toast';
import { Skeleton } from '../components/Skeleton';

const FILTERS = [
  { v: 'all', l: 'All' },
  { v: 'open', l: 'Active' },
  { v: 'draft', l: 'Draft' },
  { v: 'closed', l: 'Closed' },
];

// Employer job management: every role belonging to the employer's company
// with create / edit / view / publish / unpublish / close / reopen / delete.
// Detail editing reuses the post-job form (/post-job?edit=<id>).
export default function JobsManagePage() {
  const now = useNow();
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);
  // Brand logo for rows that predate the companyId binding or whose lookup
  // missed — falls back to the letter avatar per row.
  const [brandLogo, setBrandLogo] = useState('');
  useEffect(() => {
    let alive = true;
    api.myCompany().then((c) => { if (alive) setBrandLogo(c?.logoUrl || ''); }).catch(() => {});
    const onCompanyUpdate = () => {
      api.myCompany().then((c) => { if (alive) setBrandLogo(c?.logoUrl || ''); }).catch(() => {});
    };
    window.addEventListener('statiq:company-updated', onCompanyUpdate);
    return () => { alive = false; window.removeEventListener('statiq:company-updated', onCompanyUpdate); };
  }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const mine = await api.myPostedJobs();
      setJobs(Array.isArray(mine) ? mine : mine.items || []);
    } catch (err) {
      setJobs([]);
      setError(err?.message || 'Could not load your roles. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c = { all: jobs.length, open: 0, draft: 0, closed: 0 };
    for (const j of jobs) {
      if (j.status === 'open') c.open += 1;
      else if (j.status === 'draft') c.draft += 1;
      else if (j.status === 'closed') c.closed += 1;
    }
    return c;
  }, [jobs]);

  const visible = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter);

  const setStatus = async (j, status) => {
    const id = j._id || j.id;
    setActingId(id);
    try {
      const updated = await api.updateJob(id, { status });
      setJobs((prev) => prev.map((x) => ((x._id || x.id) === id ? { ...x, status: updated.status } : x)));
      toast?.notify(`“${j.title}” → ${jobStatusLabel(updated.status)}`, 'success');
    } catch (err) {
      toast?.notify(err?.message || 'Could not update status.', 'error');
    } finally {
      setActingId(null);
    }
  };

  const removeJob = async (j) => {
    const id = j._id || j.id;
    if (!window.confirm(`Delete “${j.title}” permanently? Applications for it stay in history.`)) return;
    setActingId(id);
    try {
      await api.deleteJob(id);
      setJobs((prev) => prev.filter((x) => (x._id || x.id) !== id));
      toast?.notify(`Deleted “${j.title}”`, 'success');
    } catch (err) {
      toast?.notify(err?.message || 'Could not delete.', 'error');
    } finally {
      setActingId(null);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Employer · Jobs</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-white">Jobs</h1>
        <Link
          to="/post-job"
          className="rounded-md bg-[#f4f4f5] px-3 py-1.5 text-sm font-semibold text-black hover:bg-neutral-300"
        >
          + Create new job
        </Link>
      </div>
      <p className="mt-1 text-sm text-neutral-400">Every role under your company — active, draft and closed.</p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter jobs by status">
        {FILTERS.map((f) => (
          <button
            key={f.v}
            type="button"
            aria-pressed={filter === f.v}
            onClick={() => setFilter(f.v)}
            className={filter === f.v
              ? 'rounded-full border border-accent bg-accent/15 px-3 py-1 text-xs font-medium text-accent'
              : 'rounded-full border border-white/15 px-3 py-1 text-xs text-neutral-300 hover:border-accent'}
          >
            {f.l} ({counts[f.v] ?? 0})
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-4 space-y-3" aria-label="Loading your roles">
          <Skeleton className="h-16 w-full !rounded-xl" />
          <Skeleton className="h-16 w-full !rounded-xl" />
          <Skeleton className="h-16 w-full !rounded-xl" />
        </div>
      )}
      {!loading && error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <p>{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-2 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accentHover"
          >
            Retry
          </button>
        </div>
      )}
      {!loading && !error && visible.length === 0 && (
        <p className="mt-4 rounded-xl border border-white/10 bg-panel p-6 text-sm text-neutral-500">
          {jobs.length === 0 ? (
            <>No roles yet. <Link to="/post-job" className="text-accent">Post your first job →</Link></>
          ) : (
            <>No {filter === 'open' ? 'active' : filter} roles.</>
          )}
        </p>
      )}
      <div className="mt-4 space-y-3">
        {visible.map((j) => {
          const id = j._id || j.id;
          const busy = actingId === id;
          return (
            <div key={id} className="rounded-xl border border-white/10 bg-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {(j.logoUrl || brandLogo) ? (
                    <img src={fileUrl(j.logoUrl || brandLogo)} alt={`${j.company || 'Company'} logo`} className="h-10 w-10 shrink-0 rounded-lg border border-white/10 object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 font-bold text-accent">
                      {String(j.company || '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-white">
                    <span className="truncate">{j.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${jobStatusBadge(j.status)}`}>
                      {jobStatusLabel(j.status)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {j.company} · {j.location} · {j.applicantCount ?? '…'} applicants
                    {j.createdAt ? ` · ${timeAgo(j.createdAt, 'Posted', now).toLowerCase()}` : ''}
                    {j.deadline ? ` · apply by ${new Date(j.deadline).toLocaleDateString()}` : ''}
                  </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/jobs/${id}`} className="rounded-md border border-white/15 px-3 py-1 text-xs text-white">View</Link>
                  <Link to={`/post-job?edit=${id}`} className="rounded-md border border-white/15 px-3 py-1 text-xs text-white hover:border-accent">Edit</Link>
                  <Link to={`/jobs/${id}/applicants`} className="rounded-md bg-[#f4f4f5] px-3 py-1 text-xs font-semibold text-black hover:bg-neutral-300">
                    Applicants →
                  </Link>
                  {j.status === 'draft' && (
                    <button onClick={() => setStatus(j, 'open')} disabled={busy} className="rounded-md border border-emerald-500/40 px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-60">
                      {busy ? '…' : 'Publish'}
                    </button>
                  )}
                  {j.status === 'open' && (
                    <button onClick={() => setStatus(j, 'draft')} disabled={busy} className="rounded-md border border-white/15 px-3 py-1 text-xs text-white hover:border-accent disabled:opacity-60">
                      {busy ? '…' : 'Unpublish'}
                    </button>
                  )}
                  {(j.status === 'open' || j.status === 'draft') && (
                    <button onClick={() => setStatus(j, 'closed')} disabled={busy} className="rounded-md border border-white/15 px-3 py-1 text-xs text-white hover:border-accent disabled:opacity-60">
                      {busy ? '…' : 'Close'}
                    </button>
                  )}
                  {j.status === 'closed' && (
                    <button onClick={() => setStatus(j, 'open')} disabled={busy} className="rounded-md border border-white/15 px-3 py-1 text-xs text-white hover:border-accent disabled:opacity-60">
                      {busy ? '…' : 'Reopen'}
                    </button>
                  )}
                  <button
                    onClick={() => removeJob(j)} disabled={busy}
                    className="rounded-md border border-red-500/30 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
