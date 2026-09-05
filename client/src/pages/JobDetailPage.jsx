import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { jobs } from '../data/mock';

export default function JobDetailPage() {
  const { id } = useParams();
  const [applied, setApplied] = useState(false);
  const job = jobs.find((j) => String(j.id) === String(id));

  if (!job) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Role not found</h1>
        <Link to="/jobs" className="mt-4 inline-block text-sm text-accent">← Back to jobs</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/jobs" className="text-sm text-slate-400 hover:text-white">← All jobs</Link>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-surface p-6 lg:col-span-2">
          <p className="text-sm font-bold text-white">{job.role}</p>
          <p className="mt-1 text-xs text-slate-400">{job.company} · {job.location} · {job.salary} · {job.type}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.tags.map((t) => (
              <span key={t} className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-300">{t}</span>
            ))}
          </div>
          <h2 className="mt-6 text-sm font-bold text-white">About the role</h2>
          <p className="mt-2 text-sm text-slate-400">{job.description}</p>
          <h2 className="mt-6 text-sm font-bold text-white">What you&apos;ll do</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">
            {job.responsibilities.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <aside className="h-fit rounded-xl border border-white/10 bg-card p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-accent/15 text-xl font-bold text-accent">
            {job.logo}
          </span>
          <p className="mt-3 text-sm font-bold text-white">{job.company}</p>
          <p className="text-xs text-slate-400">{job.tagline}</p>
          <p className="mt-2 text-xs text-slate-500">{job.note}</p>
          {applied ? (
            <p className="mt-4 rounded-md bg-accent/15 p-3 text-sm text-accent">
              Application sent (demo). The founder will reach out soon.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setApplied(true)}
                className="w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-base hover:bg-accentHover"
              >
                Apply now
              </button>
              <button className="w-full rounded-md border border-white/15 px-4 py-2 text-sm text-white">
                Save for later
              </button>
            </div>
          )}
          <p className="mt-3 text-center text-xs text-slate-600">UI-only — signup required in real version</p>
        </aside>
      </div>
    </section>
  );
}
