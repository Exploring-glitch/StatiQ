import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isSaved, toggleSaved } from '../lib/saved';

export default function JobCard({ job }) {
  const [saved, setSaved] = useState(() => isSaved(job.id));
  return (
    <article className="rounded-xl border border-white/10 bg-panel p-5 transition hover:border-accent/50">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 font-bold text-accent">
          {job.logo}
        </span>
        <div>
          <p className="text-sm font-bold text-white">
            {job.company} <span className="ml-1 text-xs font-normal text-accent">● {job.status}</span>
          </p>
          <p className="text-xs text-neutral-400">{job.tagline}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {job.tags.map((t) => (
          <span key={t} className="rounded-full border border-white/10 bg-panel2 px-2 py-0.5 text-xs text-neutral-300">{t}</span>
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-white">{job.role}</p>
      <p className="text-xs text-neutral-400">{job.meta}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-neutral-500">{job.note}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setSaved(toggleSaved(job.id))}
            className={`rounded-md border px-3 py-1 text-xs ${saved ? 'border-accent bg-accent/15 text-accent' : 'border-white/15 text-white hover:border-accent'}`}
          >
            {saved ? 'Saved ✓' : 'Save'}
          </button>
          <Link to={`/jobs/${job.id}`} className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-neutral-300">
            View role
          </Link>
        </div>
      </div>
    </article>
  );
}
