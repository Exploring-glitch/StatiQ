import { Link } from 'react-router-dom';
import { jobs } from '../data/mock';
import JobCard from './JobCard';

const points = [
  { t: 'Dream roles at the companies building what\u2019s next.', d: 'High-growth teams in AI, infra, robotics, fintech, and frontier categories.' },
  { t: 'Companies come find you.', d: 'AI sourcing surfaces you to recruiters, even when you\u2019re not looking.' },
  { t: 'Talk to the people doing the actual hiring.', d: 'Direct lines to founders and hiring managers, not third-party recruiters.' },
  { t: 'Show what you can do.', d: 'Your profile goes past the résumé: projects, work, and contribution.' },
];

export default function ForCandidates() {
  return (
    <section id="candidates" className="border-y border-white/10 bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">For candidates</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Find work that matters.</h2>
        <div className="mt-4 flex max-w-xl flex-col gap-2 sm:flex-row">
          <input
            className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white placeholder:text-slate-500"
            placeholder="Show me Software Engineer roles hiring in San Francisco"
          />
          <button className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-base hover:bg-accentHover">
            Search
          </button>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            {jobs.slice(0, 3).map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
          <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {points.map((p, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-card p-5">
                <p className="text-xs font-bold text-accent">0{i + 1}</p>
                <p className="mt-1 text-sm font-bold text-white">{p.t}</p>
                <p className="mt-1 text-xs text-slate-400">{p.d}</p>
              </div>
            ))}
            <div className="flex gap-3 sm:col-span-2">
              <Link to="/signup/job" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-base hover:bg-accentHover">Sign up for free →</Link>
              <Link to="/for-job-seekers" className="rounded-md border border-white/15 px-4 py-2 text-sm text-white">Learn more</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
