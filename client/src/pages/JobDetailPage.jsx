import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { normalizeJob } from '../lib/jobs';
import { timeAgo, useNow } from '../lib/time';
import { jobs as mockJobs } from '../data/mock';
import { isSaved, toggleSaved } from '../lib/saved';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ApplyModal from '../components/ApplyModal';
import JobCard from '../components/JobCard';

export default function JobDetailPage() {
  const { id } = useParams();
  const now = useNow();
  const { user } = useAuth();
  const toast = useToast();
  const isEmployer = user?.role === 'employer';
  const nav = useNavigate();
  const [job, setJob] = useState(null);
  const [missing, setMissing] = useState(false);
  const [applied, setApplied] = useState(false);
  const [answer, setAnswer] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [managing, setManaging] = useState(false);
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
    const href = window.location.href;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
        return;
      } catch {
        // Clipboard API denied — fall through to legacy copy.
      }
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = href;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      // Deprecated but still the widest-supported fallback for non-secure contexts.
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
    } catch {
      toast?.notify('Copy this link manually', 'error');
      return;
    }
    setTimeout(() => setCopied(false), 1800);
  };

  const apply = () => {
    if (!user) {
      nav(`/login/job?next=${encodeURIComponent(`/jobs/${id}`)}`);
      return;
    }
    setMsg('');
    setShowApply(true);
  };

  const submitApplication = async (note) => {
    setMsg('');
    setBusy(true);
    try {
      await api.apply(id, note);
      setAnswer(note);
      setApplied(true);
      setShowApply(false);
      toast?.notify('Application sent', 'success');
    } catch (err) {
      setMsg(err.message);
      toast?.notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async () => {
    setManaging(true);
    try {
      const next = job.status === 'Closed' ? 'open' : 'closed';
      const updated = await api.updateJob(id, { status: next });
      setJob(normalizeJob(updated));
      toast?.notify(next === 'closed' ? 'Role closed' : 'Role reopened', 'success');
    } catch (err) {
      toast?.notify(err.message, 'error');
    } finally {
      setManaging(false);
    }
  };

  const removeJob = async () => {
    if (!window.confirm(`Delete “${job.role}” permanently?`)) return;
    setManaging(true);
    try {
      await api.deleteJob(id);
      toast?.notify('Role deleted', 'success');
      nav('/dashboard');
    } catch (err) {
      toast?.notify(err.message, 'error');
      setManaging(false);
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
  const isClosed = job.status === 'Closed';
  const isExpired = job.deadline ? new Date(job.deadline).getTime() < now : false;
  const isInactive = isClosed || isExpired;

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
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-white">{job.role}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${job.status === 'Closed' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
              {job.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            <Link
              to={`/companies/${encodeURIComponent(job.companySlug || String(job.company || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`}
              className="font-semibold text-accent hover:underline"
              title={`View ${job.company} profile`}
            >
              {job.company}
            </Link>
            {' '}· {job.location} · {job.salaryDisplay || job.salary} · {job.type}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            {job.workMode && <span className="rounded-full border border-white/10 bg-panel2 px-2 py-0.5 text-neutral-300">{job.workMode}</span>}
            {job.experienceLevel && <span className="rounded-full border border-white/10 bg-panel2 px-2 py-0.5 text-neutral-300 capitalize">{job.experienceLevel}</span>}
            {job.openings > 1 && <span className="rounded-full border border-white/10 bg-panel2 px-2 py-0.5 text-neutral-300">{job.openings} openings</span>}
            {job.deadline && <span className="rounded-full border border-white/10 bg-panel2 px-2 py-0.5 text-neutral-300">Apply by {new Date(job.deadline).toLocaleDateString()}</span>}
          </div>
          {timeAgo(job.createdAt, 'Posted', now) && (
            <p className="mt-1 text-xs text-neutral-500" title={job.createdAt ? new Date(job.createdAt).toLocaleString() : ''}>
              {timeAgo(job.createdAt, 'Posted', now)}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {job.tags.map((t) => (
              <span key={t} className="rounded-full border border-white/10 bg-panel2 px-2 py-0.5 text-xs text-neutral-300">{t}</span>
            ))}
          </div>
          <h2 className="mt-6 text-sm font-bold text-white">About the role</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-400">{job.description || 'No description yet.'}</p>
          {job.responsibilities.length > 0 && (
            <>
              <h2 className="mt-6 text-sm font-bold text-white">What you&apos;ll do</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-400">
                {job.responsibilities.map((r, i) => (
                  <li key={`${r}-${i}`}>{r}</li>
                ))}
              </ul>
            </>
          )}
          {(job.requirements?.length > 0) && (
            <>
              <h2 className="mt-6 text-sm font-bold text-white">Requirements</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-400">
                {job.requirements.map((r, i) => (
                  <li key={`${r}-${i}`}>{r}</li>
                ))}
              </ul>
            </>
          )}
          {(job.benefits?.length > 0) && (
            <>
              <h2 className="mt-6 text-sm font-bold text-white">Benefits</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-400">
                {job.benefits.map((r, i) => (
                  <li key={`${r}-${i}`}>{r}</li>
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
          <Link
            to={`/companies/${encodeURIComponent(job.companySlug || String(job.company || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`}
            className="mt-3 block rounded-md border border-white/15 px-4 py-2 text-center text-sm text-white hover:border-accent"
          >
            View company profile →
          </Link>
          {isEmployer ? (
            <div className="mt-4 space-y-2">
              <Link
                to={`/jobs/${id}/applicants`}
                className="block w-full rounded-md bg-[#f4f4f5] px-4 py-2 text-center text-sm font-semibold text-black hover:bg-neutral-300"
              >
                View applicants →
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={toggleStatus} disabled={managing}
                  className="flex-1 rounded-md border border-white/15 px-4 py-2 text-sm text-white hover:border-accent disabled:opacity-60"
                >
                  {managing ? 'Updating…' : job.status === 'Closed' ? 'Reopen role' : 'Close role'}
                </button>
                <button
                  onClick={removeJob} disabled={managing}
                  className="flex-1 rounded-md border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
              <Link
                to="/dashboard"
                className="block w-full rounded-md border border-white/15 px-4 py-2 text-center text-sm text-white hover:border-accent"
              >
                Back to dashboard
              </Link>
            </div>
          ) : applied ? (
            <div className="mt-4 rounded-md bg-accent/15 p-3">
              <p className="text-sm text-accent">
                Application sent. The hiring team will reach out soon.
              </p>
              {answer && <p className="mt-2 text-xs italic text-neutral-400">“{answer}”</p>}
            </div>
          ) : isInactive ? (
            <div className="mt-4 rounded-md border border-white/10 bg-panel2 p-3">
              <p className="text-sm font-semibold text-white">
                {isClosed ? 'Applications closed' : 'Application deadline passed'}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                This role is no longer accepting applications, but you can save it or explore similar roles below.
              </p>
              <div className="mt-3 flex gap-2">
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
          ) : (
            <div className="mt-4 space-y-2">
              <button
                onClick={apply} disabled={busy}
                className="w-full rounded-md bg-[#f4f4f5] px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-300 disabled:opacity-60"
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
      {showApply && !applied && (
        <ApplyModal
          company={job.company}
          role={job.role}
          busy={busy}
          error={msg}
          onClose={() => setShowApply(false)}
          onSubmit={submitApplication}
        />
      )}
    </section>
  );
}
