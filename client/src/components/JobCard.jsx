import { Link } from 'react-router-dom';

export default function JobCard({ job }) {
  return (
    <article className="rounded-xl border border-white/10 bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 font-bold text-accent">
          {job.logo}
        </span>
        <div>
          <p className="text-sm font-bold text-white">
            {job.company} <span className="ml-1 text-xs font-normal text-accent">● {job.status}</span>
          </p>
          <p className="text-xs text-slate-400">{job.tagline}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {job.tags.map((t) => (
          <span key={t} className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-300">{t}</span>
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-white">{job.role}</p>
      <p className="text-xs text-slate-400">{job.meta}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-slate-500">{job.note}</span>
        <div className="flex gap-2">
          <button className="rounded-md border border-white/15 px-3 py-1 text-xs text-white">Save</button>
          <Link to={`/jobs/${job.id}`} className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-base">
            View role
          </Link>
        </div>
      </div>
    </article>
  );
}
