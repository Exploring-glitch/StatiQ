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
        <h1 className="mt-2 max-w-2xl text-3xl font-bold text-neutral-900">Hire your next defining team member on StatiQ.</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-500">
          Post free, source with AI, or let a dedicated recruiter run the search for you.
        </p>
        <div className="mt-4 flex gap-3">
          <Link to="/signup/hire" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700">
            Start hiring →
          </Link>
          <Link to="/jobs" className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-900">
            See talent flow
          </Link>
        </div>
      </section>
      <ForCompanies />
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="text-xl font-bold text-neutral-900">Simple pricing (UI preview)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className="rounded-xl border border-neutral-200 bg-[#F4F4F2] p-6">
              <p className="text-sm font-bold text-neutral-900">{t.name}</p>
              <p className="mt-1 text-2xl font-extrabold text-accent">{t.price}</p>
              <p className="mt-2 text-sm text-neutral-500">{t.desc}</p>
              <Link to="/signup/hire" className="mt-4 block w-full rounded-md border border-neutral-300 px-4 py-2 text-center text-sm text-neutral-900 hover:border-accent">
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
