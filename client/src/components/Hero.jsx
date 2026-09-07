import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 text-center">
      <p className="mb-3 inline-block rounded-full border border-white/10 bg-panel px-3 py-1 text-xs text-neutral-400">
        Interview booked · just now &nbsp;·&nbsp; Chime · 38 applicants
      </p>
      <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
        Where great companies meet great people.
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-400">
        The AI recruiting platform for startups. Post jobs free, deploy AI sourcing
        agents, or hire with a dedicated recruiter.
      </p>
      <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">For companies</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Find your next hire.</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Post jobs free, deploy AI sourcing agents, or hand it to an Autopilot recruiter.
          </p>
          <Link to="/for-companies" className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-300">
            Start hiring →
          </Link>
          <div className="mt-4 rounded-lg border border-white/10 bg-panel2 p-3 text-xs text-neutral-400">
            Reach agent · working now — Priya Shah (Sr Eng, 7 YOE) replied · Marcus Bennett (Staff, 9 YOE) pitched
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">For candidates</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Find your next job.</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Apply directly to founders and hiring managers at 27,000+ startups building what&apos;s next.
          </p>
          <Link to="/jobs" className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accentHover">
            Browse jobs →
          </Link>
          <div className="mt-4 rounded-lg border border-white/10 bg-panel2 p-3 text-xs text-neutral-400">
            Matched to you · today — Senior Backend Engineer @ Chime · $180–240K · Founding Designer @ Lovable
          </div>
        </div>
      </div>
    </section>
  );
}
