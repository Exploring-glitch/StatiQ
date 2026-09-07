import { Link } from 'react-router-dom';

const cols = [
  {
    h: 'For companies',
    links: [
      { label: 'Recruiting platform', to: '/for-companies' },
      { label: 'Post jobs for free', to: '/for-companies' },
      { label: 'AI candidate sourcing', to: '/for-companies' },
      { label: 'Plans and pricing', to: '/for-companies' },
    ],
  },
  {
    h: 'For candidates',
    links: [
      { label: 'Candidate overview', to: '/for-job-seekers' },
      { label: 'Startup jobs', to: '/jobs' },
      { label: 'Remote jobs', to: '/jobs' },
      { label: 'Get discovered', to: '/signup/job' },
    ],
  },
  {
    h: 'Company',
    links: [
      { label: 'About StatiQ', to: '/' },
      { label: 'For companies', to: '/for-companies' },
      { label: 'For job seekers', to: '/for-job-seekers' },
      { label: 'Contact', to: '/signup' },
    ],
  },
  {
    h: 'Account',
    links: [
      { label: 'Log in', to: '/login' },
      { label: 'Sign up', to: '/signup' },
      { label: 'Browse jobs', to: '/jobs' },
    ],
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
    <footer className="border-t border-white/10 bg-[#0E1114]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-5">
          <div>
            <Link to="/" className="text-xl font-extrabold text-white">Stati<span className="text-accent">Q</span></Link>
            <p className="mt-2 text-xs text-neutral-400">The AI recruiting platform and talent marketplace for startups.</p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <p className="text-sm font-bold text-white">{c.h}</p>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}><Link to={l.to} className="text-xs text-neutral-400 hover:text-white">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
          {browse.map((b) => (
            <div key={b.h}>
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">{b.h}</p>
              <ul className="mt-2 space-y-1.5">
                {b.links.map((l) => (
                  <li key={l}><Link to="/jobs" className="text-xs text-neutral-500 hover:text-white">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-neutral-500">© 2026 StatiQ. All rights reserved.</p>
      </div>
    </footer>
  );
}
