import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { normalizeJob } from '../lib/jobs';
import { jobs as mockJobs } from '../data/mock';
import { useAuth } from '../context/AuthContext';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [job, setJob] = useState(null);
  const [missing, setMissing] = useState(false);
  const [applied, setApplied] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
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
      <Link to="/jobs" className="text-sm text-neutral-400 hover:text-white">← All jobs</Link>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-panel p-6 lg:col-span-2">
          <p className="text-sm font-bold text-white">{job.role}</p>
          <p className="mt-1 text-xs text-neutral-400">{job.company} · {job.location} · {job.salary} · {job.type}</p>
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
          {applied ? (
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
            </div>
          )}
          {msg && <p className="mt-2 rounded-md bg-red-500/10 p-2 text-xs text-red-400">{msg}</p>}
        </aside>
      </div>
    </section>
  );
}
