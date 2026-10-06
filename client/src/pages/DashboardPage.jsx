import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fileUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { timeAgo, useNow } from '../lib/time';
import { greetingFor, jobStatusBadge, jobStatusLabel } from '../lib/employer';
import { Skeleton } from '../components/Skeleton';

// Employer home: Good evening, Sreeja 👋 / Lupira + Active jobs,
// Applications, New + Recent applications + quick Post a job / company access.
// Role management lives under Jobs (/jobs/manage); per-job applicant detail
// under Applicants (/jobs/:id/applicants).
export default function DashboardPage() {
  const { user } = useAuth();
  const now = useNow();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [mine, stats, posted] = await Promise.all([
          api.myCompany().catch(() => null),
          api.receivedOverview().catch(() => null),
          api.myPostedJobs().catch(() => []),
        ]);
        if (!alive) return;
        setCompany(mine || null);
        setOverview(stats || null);
        setJobs(Array.isArray(posted) ? posted : posted.items || []);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || 'Could not load your overview. Check your connection and try again.');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    // Refresh the brand header the moment a new logo is uploaded elsewhere.
    const onCompanyUpdate = () => {
      api.myCompany().then((c) => { if (alive) setCompany(c || null); }).catch(() => {});
    };
    window.addEventListener('statiq:company-updated', onCompanyUpdate);
    return () => { alive = false; window.removeEventListener('statiq:company-updated', onCompanyUpdate); };
  }, [attempt]);

  const firstName = (user?.name || '').split(' ')[0] || 'there';
  const totals = overview?.totals || {};
  const recent = overview?.recent || [];
  // Fall back to local counts when the overview endpoint is unavailable.
  const activeJobs = totals.activeJobs ?? jobs.filter((j) => j.status === 'open').length;
  const totalApps = totals.total ?? jobs.reduce((s, j) => s + (j.applicantCount ?? 0), 0);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Employer dashboard</p>
      <h1 className="mt-2 text-3xl font-bold text-white">
        {greetingFor()}, {firstName} 👋
      </h1>
      {company?.name && (
        <div className="mt-3 flex items-center gap-3">
          {company.logoUrl ? (
            <img src={fileUrl(company.logoUrl)} alt={`${company.name} logo`} className="h-11 w-11 rounded-xl border border-white/10 object-cover" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-lg font-extrabold text-accent">
              {(company.name || '?').charAt(0).toUpperCase()}
            </span>
          )}
          <p className="text-sm text-neutral-400">
            <Link to="/company/manage" className="font-semibold text-white hover:text-accent">
              {company.name}
            </Link>
            {company.location ? ` · ${company.location}` : ''}
          </p>
        </div>
      )}

      {loading && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Loading overview">
          <Skeleton className="h-24 w-full !rounded-xl" />
          <Skeleton className="h-24 w-full !rounded-xl" />
          <Skeleton className="h-24 w-full !rounded-xl" />
        </div>
      )}
      {!loading && error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setAttempt((a) => a + 1)}
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
              <p className="text-2xl font-extrabold text-white">{activeJobs}</p>
              <p className="text-xs text-neutral-500">Active jobs</p>
              <Link to="/jobs/manage" className="mt-2 block text-xs font-semibold text-accent hover:underline">
                Manage jobs →
              </Link>
            </div>
            <div className="rounded-xl border border-white/10 bg-panel p-5">
              <p className="text-2xl font-extrabold text-white">{totalApps}</p>
              <p className="text-xs text-neutral-500">Total applications</p>
              <Link to="/applicants" className="mt-2 block text-xs font-semibold text-accent hover:underline">
                View applicants →
              </Link>
            </div>
            <div className="rounded-xl border border-white/10 bg-panel p-5">
              <p className="text-2xl font-extrabold text-white">{totals.new ?? 0}</p>
              <p className="text-xs text-neutral-500">New applications</p>
              <p className="mt-2 text-xs text-neutral-500">Untriaged · status “applied”</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-panel p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Recent applications</h2>
                <Link to="/applicants" className="text-xs font-semibold text-accent hover:underline">
                  All applicants →
                </Link>
              </div>
              {recent.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-500">
                  No applications yet. <Link to="/post-job" className="text-accent">Post a job →</Link>
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-white/5">
                  {recent.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {r.applicantName}
                          <span className="font-normal text-neutral-500"> — {r.jobTitle}</span>
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {r.status}{r.createdAt ? ` · ${timeAgo(r.createdAt, 'Applied', now).toLowerCase()}` : ''}
                        </p>
                      </div>
                      <Link
                        to={`/jobs/${r.jobId}/applicants`}
                        className="shrink-0 rounded-md border border-white/15 px-2.5 py-1 text-xs text-white hover:border-accent"
                      >
                        Review →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="h-fit space-y-3 rounded-xl border border-white/10 bg-panel p-5">
              <h2 className="text-sm font-bold text-white">Quick actions</h2>
              <Link
                to="/post-job"
                className="block rounded-lg bg-[#f4f4f5] px-3 py-2 text-center text-sm font-semibold text-black hover:bg-neutral-300"
              >
                + Post a new job
              </Link>
              <Link
                to="/company/manage"
                className="block rounded-lg border border-white/15 px-3 py-2 text-center text-sm font-semibold text-white hover:border-accent"
              >
                Company profile →
              </Link>
              <p className="text-xs text-neutral-500">Logo, overview, people, culture — what seekers see.</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Your roles</h2>
            <Link to="/jobs/manage" className="text-xs font-semibold text-accent hover:underline">
              Manage all →
            </Link>
          </div>
          {jobs.length === 0 ? (
            <p className="mt-4 rounded-xl border border-white/10 bg-panel p-6 text-sm text-neutral-500">
              No roles yet. <Link to="/post-job" className="text-accent">Post your first job →</Link>
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {jobs.slice(0, 5).map((j) => {
                const id = j._id || j.id;
                const jobLogo = j.logoUrl || company?.logoUrl;
                return (
                  <div key={id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-panel p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {jobLogo ? (
                        <img src={fileUrl(jobLogo)} alt={`${j.company || company?.name || 'Company'} logo`} className="h-10 w-10 shrink-0 rounded-lg border border-white/10 object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 font-bold text-accent">
                          {String(j.company || company?.name || '?').charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-white">
                        <span className="truncate">{j.title}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${jobStatusBadge(j.status)}`}>
                          {jobStatusLabel(j.status)}
                        </span>
                      </p>
                      <p className="text-xs text-neutral-500">
                        {j.location} · {j.applicantCount ?? '…'} applicants
                        {j.createdAt ? ` · ${timeAgo(j.createdAt, 'Posted', now).toLowerCase()}` : ''}
                      </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link to={`/jobs/${id}`} className="rounded-md border border-white/15 px-3 py-1 text-xs text-white">View</Link>
                      <Link to={`/jobs/${id}/applicants`} className="rounded-md bg-[#f4f4f5] px-3 py-1 text-xs font-semibold text-black hover:bg-neutral-300">
                        Applicants →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
