import { Link } from 'react-router-dom';
import { jobs } from '../data/mock';
import JobCard from '../components/JobCard';

const steps = [
  { n: '01', t: 'Create your profile', d: 'Show projects, skills, and what you want next — beyond a résumé.' },
  { n: '02', t: 'Get discovered', d: 'AI sourcing surfaces you to founders hiring right now.' },
  { n: '03', t: 'Talk to founders directly', d: 'No middlemen. Chat with hiring managers and get fast replies.' },
];

export default function ForSeekersPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">For job seekers</p>
      <h1 className="mt-2 max-w-2xl text-3xl font-bold text-white">Find work that matters.</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        Join 10M+ candidates who want startup roles. Free forever for seekers.
      </p>
      <div className="mt-4 flex gap-3">
        <Link to="/signup?type=job" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-base hover:bg-accentHover">
          Sign up for free →
        </Link>
        <Link to="/jobs" className="rounded-md border border-white/15 px-4 py-2 text-sm text-white">
          Browse jobs
        </Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-xl border border-white/10 bg-surface p-6">
            <p className="text-xs font-bold text-accent">{s.n}</p>
            <p className="mt-1 text-sm font-bold text-white">{s.t}</p>
            <p className="mt-1 text-sm text-slate-400">{s.d}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 text-xl font-bold text-white">Featured roles</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {jobs.slice(0, 4).map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </div>
    </section>
  );
}
