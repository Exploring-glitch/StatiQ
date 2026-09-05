const cols = [
  {
    h: 'For companies',
    links: ['Recruiting platform', 'Post jobs for free', 'AI candidate sourcing', 'Managed recruiting', 'Plans and pricing'],
  },
  {
    h: 'For candidates',
    links: ['Candidate overview', 'Startup jobs', 'Remote jobs', 'Get discovered', 'Salary calculator'],
  },
  {
    h: 'Company',
    links: ['About StatiQ', 'Customer stories', 'Blog', 'Careers', 'Contact'],
  },
  {
    h: 'Trust & support',
    links: ['Help center', 'Trust center', 'Platform status', 'Privacy & cookies', 'Terms & risks'],
  },
];

const browse = [
  { h: 'Jobs by role', links: ['Software Engineer', 'Product Manager', 'Product Designer', 'Data Analyst'] },
  { h: 'Remote jobs', links: ['Remote Engineer', 'Remote Designer', 'Remote Manager', 'More remote jobs →'] },
  { h: 'Jobs by location', links: ['San Francisco', 'New York City', 'Bangalore', 'Remote'] },
  { h: 'Collections', links: ['Junior engineer jobs', 'Bootcamp grads', 'Tech startups', 'Startups hiring now'] },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface/60">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-5">
          <div>
            <p className="text-xl font-extrabold text-white">Stati<span className="text-accent">Q</span></p>
            <p className="mt-2 text-xs text-slate-400">The AI recruiting platform and talent marketplace for startups.</p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <p className="text-sm font-bold text-white">{c.h}</p>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => (
                  <li key={l}><a href="#" className="text-xs text-slate-400 hover:text-white">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
          {browse.map((b) => (
            <div key={b.h}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-300">{b.h}</p>
              <ul className="mt-2 space-y-1.5">
                {b.links.map((l) => (
                  <li key={l}><a href="#" className="text-xs text-slate-500 hover:text-white">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-slate-600">© 2026 StatiQ. All rights reserved.</p>
      </div>
    </footer>
  );
}
