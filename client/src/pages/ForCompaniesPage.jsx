import { Link } from 'react-router-dom';
import ForCompanies from '../components/ForCompanies';

const tiers = [
  { name: 'Jobs', price: 'Free', desc: 'Post unlimited jobs, get applicants, built-in ATS.', cta: 'Post a job' },
  { name: 'Reach', price: '$135 / seat', desc: 'AI sourcing agents + personalized outreach from your inbox.', cta: 'Try Reach' },
  { name: 'Autopilot', price: '$500 / role', desc: 'Dedicated recruiter + 5-10 candidates per week.', cta: 'Talk to sales' },
];

export default function ForCompaniesPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-2 pt-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">For companies</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold text-white">Hire your next defining team member on StatiQ.</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Post free, source with AI, or let a dedicated recruiter run the search for you.
        </p>
        <div className="mt-4 flex gap-3">
          <Link to="/signup/hire" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-base hover:bg-accentHover">
            Start hiring →
          </Link>
          <Link to="/jobs" className="rounded-md border border-white/15 px-4 py-2 text-sm text-white">
            See talent flow
          </Link>
        </div>
      </section>
      <ForCompanies />
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="text-xl font-bold text-white">Simple pricing (UI preview)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className="rounded-xl border border-white/10 bg-surface p-6">
              <p className="text-sm font-bold text-white">{t.name}</p>
              <p className="mt-1 text-2xl font-extrabold text-accent">{t.price}</p>
              <p className="mt-2 text-sm text-slate-400">{t.desc}</p>
              <button className="mt-4 w-full rounded-md border border-white/15 px-4 py-2 text-sm text-white hover:border-accent">
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
