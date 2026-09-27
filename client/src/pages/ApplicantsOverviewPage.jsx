import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { APPLICANT_BUCKETS, bucketCount, jobStatusBadge, jobStatusLabel } from '../lib/employer';
import { Skeleton } from '../components/Skeleton';

// Employer Applicants overview: every managed role grouped with its
// pipeline buckets (New → Shortlisted → Interview → Offer → Rejected).
// Per-candidate review stays on the per-job page (/jobs/:id/applicants).
// Application path: Job Seeker → Application → Job → Company.
export default function ApplicantsOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api.receivedOverview());
    } catch (err) {
      setData(null);
      setError(err?.message || 'Could not load applicants. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const perJob = data?.perJob || [];
  const totals = data?.totals || {};

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Employer · Applicants</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-white">Applicants</h1>
        <Link
          to="/jobs/manage"
          className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white hover:border-accent"
        >
          Manage jobs →
        </Link>
      </div>
      <p className="mt-1 text-sm text-neutral-400">Grouped by job — open a role to review, shortlist or reject.</p>

      {loading && (
        <div className="mt-6 space-y-3" aria-label="Loading applicants">
          <Skeleton className="h-24 w-full !rounded-xl" />
          <Skeleton className="h-24 w-full !rounded-xl" />
        </div>
      )}
      {!loading && error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
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
      {!loading && !error && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-panel p-5">
              <p className="text-2xl font-extrabold text-white">{totals.total ?? 0}</p>
              <p className="text-xs text-neutral-500">Total applications</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-panel p-5">
              <p className="text-2xl font-extrabold text-white">{totals.new ?? 0}</p>
              <p className="text-xs text-neutral-500">New — needs triage</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-panel p-5">
              <p className="text-2xl font-extrabold text-white">{totals.jobs ?? 0}</p>
              <p className="text-xs text-neutral-500">Roles with pipelines</p>
            </div>
          </div>

          {perJob.length === 0 ? (
            <p className="mt-4 rounded-xl border border-white/10 bg-panel p-6 text-sm text-neutral-500">
              No roles yet. <Link to="/post-job" className="text-accent">Post your first job →</Link>
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {perJob.map((b) => (
                <div key={b.jobId} className="rounded-xl border border-white/10 bg-panel p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-white">
                        <span className="truncate">{b.title}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${jobStatusBadge(b.status)}`}>
                          {jobStatusLabel(b.status)}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">{b.total} applicant{b.total === 1 ? '' : 's'}</p>
                    </div>
                    <Link
                      to={`/jobs/${b.jobId}/applicants`}
                      className="rounded-md bg-[#f4f4f5] px-3 py-1 text-xs font-semibold text-black hover:bg-neutral-300"
                    >
                      Review →
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {APPLICANT_BUCKETS.map((bucket) => (
                      <span
                        key={bucket.key}
                        className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-neutral-300"
                      >
                        {bucket.label} — <span className="font-bold text-white">{bucketCount(b.counts, bucket.key)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
