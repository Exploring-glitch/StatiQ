import { Link } from 'react-router-dom';

const items = [
  {
    n: '01',
    title: 'StatiQ Jobs',
    sub: 'Post once. Reach startup talent.',
    text: 'Post free and get in front of 10M candidates who joined StatiQ because they want startup opportunities.',
  },
  {
    n: '02',
    title: 'StatiQ Reach',
    sub: 'Find the candidates other searches miss.',
    text: 'Search 500M+ profiles, uncover adjacent experience, and run personalized outreach from your inbox.',
  },
  {
    n: '03',
    title: 'StatiQ Autopilot',
    sub: 'Hire faster with hands-on support.',
    text: 'Get a dedicated recruiter who sources, pitches, and schedules qualified candidates onto your calendar.',
  },
];

export default function ForCompanies() {
  return (
    <section id="companies" className="mx-auto max-w-6xl px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">For companies</p>
      <h2 className="mt-2 max-w-xl text-3xl font-bold text-white">Build the team that defines what&apos;s next.</h2>
      <p className="mt-3 max-w-2xl text-sm text-slate-400">
        The team you hire is the company you become. StatiQ is where startup people come to be found.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.n} className="rounded-xl border border-white/10 bg-surface p-6">
            <p className="text-xs font-bold text-slate-500">{it.n}</p>
            <h3 className="mt-1 text-lg font-bold text-white">{it.title}</h3>
            <p className="mt-1 text-sm font-medium text-slate-200">{it.sub}</p>
            <p className="mt-2 text-sm text-slate-400">{it.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/for-companies" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-base hover:bg-accentHover">
          Find your next hire →
        </Link>
        <Link to="/signup?type=hire" className="rounded-md border border-white/15 px-4 py-2 text-sm text-white hover:border-accent">
          Schedule a demo
        </Link>
      </div>
    </section>
  );
}
