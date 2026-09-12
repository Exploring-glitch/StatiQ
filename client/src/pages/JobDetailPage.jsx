import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { normalizeJob } from '../lib/jobs';
import { jobs as mockJobs } from '../data/mock';
import { isSaved, toggleSaved } from '../lib/saved';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';

const timeAgo = (iso) => {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return '';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return mins <= 1 ? 'Posted just now' : `Posted ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Posted ${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return days === 1 ? 'Posted yesterday' : `Posted ${days}d ago`;
  return `Posted on ${new Date(iso).toLocaleDateString()}`;
};

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';
  const nav = useNavigate();
  const [job, setJob] = useState(null);
  const [missing, setMissing] = useState(false);
  const [applied, setApplied] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(() => isSaved(id));
  const [copied, setCopied] = useState(false);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    let alive = true;
    setSaved(isSaved(id));
    setCopied(false);
    api.job(id)
      .then((j) => alive && setJob(normalizeJob(j)))
      .catch(() => {
        if (!alive) return;
        const m = mockJobs.find((j) => String(j.id) === String(id));
        if (m) setJob(normalizeJob(m));
        else setMissing(true);
      });
    return () => { alive = false; };
  }, [id]);

  // Re-check after login/logout or cross-device sync merges new ids.
  useEffect(() => {
    setSaved(isSaved(id));
  }, [user, id]);

  // Similar roles: same type / mode / shared tags first, current job excluded.
  useEffect(() => {
    if (!job) return;
    let alive = true;
    const pick = (list) => {
      const scored = list
        .filter((j) => String(j.id) !== String(job.id))
        .map((j) => {
          let s = 0;
          if (j.type && j.type === job.type) s += 2;
          if (j.workMode && j.workMode === job.workMode) s += 2;
          if (j.company && j.company === job.company) s += 3;
          const tags = new Set(job.tags || []);
          s += (j.tags || []).filter((t) => tags.has(t)).length;
          return { j, s };
        })
        .sort((a, b) => b.s - a.s)
        .slice(0, 3)
        .map((x) => x.j);
      if (alive) setSimilar(scored);
    };
    api.jobs({ limit: 50 })
      .then((data) => pick((data.items || data).map(normalizeJob)))
      .catch(() => pick(mockJobs.map(normalizeJob)));
    return () => { alive = false; };
  }, [job]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const apply = async () => {
    if (!user) {
      nav(`/login/job?next=${encodeURIComponent(`/jobs/${id}`)}`);
      return;
    }
    setMsg('');
    setBusy(true);
    try {
      await api.apply(id);
      setApplied(true);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (missing) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Role not found</h1>
        <Link to="/jobs" className="mt-4 inline-block text-sm text-accent">← Back to jobs</Link>
      </section>
    );
  }
  if (!job) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-neutral-400">Loading role…</p>;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <Link to={isEmployer ? '/dashboard' : '/jobs'} className="text-sm text-neutral-400 hover:text-white">
        {isEmployer ? '← Back to dashboard' : '← All jobs'}
      </Link>
      {isEmployer && (
        <p className="mt-3 rounded-lg border border-accent/30 bg-accent/10 p-3 text-xs text-accent">
          👁 Hiring-mode preview — seekers see an <strong>Apply now</strong> button here. You see applicant actions below.
        </p>
      )}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-panel p-6 lg:col-span-2">
          <p className="text-sm font-bold text-white">{job.role}</p>
          <p className="mt-1 text-xs text-neutral-400">{job.company} · {job.location} · {job.salary} · {job.type}</p>
          {timeAgo(job.createdAt) && <p className="mt-1 text-xs text-neutral-500">{timeAgo(job.createdAt)}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {job.tags.map((t) => (
              <span key={t} className="rounded-full border border-white/10 bg-panel2 px-2 py-0.5 text-xs text-neutral-300">{t}</span>
            ))}
          </div>
          <h2 className="mt-6 text-sm font-bold text-white">About the role</h2>
          <p className="mt-2 text-sm text-neutral-400">{job.description || 'No description yet.'}</p>
          {job.responsibilities.length > 0 && (
            <>
              <h2 className="mt-6 text-sm font-bold text-white">What you&apos;ll do</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-400">
                {job.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        <aside className="h-fit rounded-xl border border-white/10 bg-panel p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-accent/15 text-xl font-bold text-accent">
            {job.logo}
          </span>
          <p className="mt-3 text-sm font-bold text-white">{job.company}</p>
          <p className="text-xs text-neutral-400">{job.tagline}</p>
          <p className="mt-2 text-xs text-neutral-500">{job.note}</p>
          {isEmployer ? (
            <div className="mt-4 space-y-2">
              <Link
                to={`/jobs/${id}/applicants`}
                className="block w-full rounded-md bg-white px-4 py-2 text-center text-sm font-semibold text-black hover:bg-neutral-300"
              >
                View applicants →
              </Link>
              <Link
                to="/dashboard"
                className="block w-full rounded-md border border-white/15 px-4 py-2 text-center text-sm text-white hover:border-accent"
              >
                Back to dashboard
              </Link>
            </div>
          ) : applied ? (
            <p className="mt-4 rounded-md bg-accent/15 p-3 text-sm text-accent">
              Application sent. The hiring team will reach out soon.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              <button
                onClick={apply} disabled={busy}
                className="w-full rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-300 disabled:opacity-60"
              >
                {busy ? 'Applying…' : user ? 'Apply now' : 'Log in to apply'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setSaved(toggleSaved(job.id))}
                  className={`flex-1 rounded-md border px-4 py-2 text-sm ${saved ? 'border-accent bg-accent/15 text-accent' : 'border-white/15 text-white hover:border-accent'}`}
                >
                  {saved ? 'Saved ✓' : 'Save'}
                </button>
                <button
                  onClick={share}
                  title="Copy link to this role"
                  className="flex-1 rounded-md border border-white/15 px-4 py-2 text-sm text-white hover:border-accent"
                >
                  {copied ? 'Copied ✓' : 'Share'}
                </button>
              </div>
            </div>
          )}
          {msg && <p className="mt-2 rounded-md bg-red-500/10 p-2 text-xs text-red-400">{msg}</p>}
        </aside>
      </div>
      {similar.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-white">Similar roles</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {similar.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
