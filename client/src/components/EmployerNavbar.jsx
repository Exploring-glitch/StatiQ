import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const sideLink = ({ isActive }) =>
  `flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
    isActive
      ? 'bg-accent/15 font-semibold text-accent'
      : 'text-neutral-400 hover:bg-white/5 hover:text-white'
  }`;

// ── Employer shell: ATS-style sidebar + company topbar ──
// Deliberately different structure from the seeker top-nav so the
// "I'm hiring" product feels like a different app.
export default function EmployerNavbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const out = () => {
    logout();
    setOpen(false);
    nav('/');
  };

  const initials = (user?.company || user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-[#0E1116] lg:flex">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link to="/dashboard" className="text-xl font-extrabold tracking-tight text-white">
            Stati<span className="text-accent">Q</span>
          </Link>
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
            Hiring
          </span>
        </div>

        {/* Company card — employer identity, seekers never see this */}
        <div className="mx-3 mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-panel p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-extrabold text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{user?.company || 'Your company'}</p>
            <p className="truncate text-xs text-neutral-500">{user?.name || ''} · Owner</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-600">Hire</p>
          <NavLink to="/dashboard" end className={sideLink}>📊 Dashboard</NavLink>
          <NavLink to="/post-job" className={sideLink}>＋ Post a job</NavLink>
          <NavLink to="/jobs" className={sideLink}>👁 Preview listings <span className="text-[11px] text-neutral-600">live</span></NavLink>
          <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-neutral-600">Company</p>
          <NavLink to="/profile" className={sideLink}>🏢 Company profile</NavLink>
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            to="/post-job"
            className="block rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold text-black hover:bg-neutral-300"
          >
            + New role
          </Link>
          <div className="mt-2 flex items-center justify-between px-1">
            <span className="text-xs text-neutral-500">{user?.email}</span>
            <button onClick={out} className="text-xs text-neutral-400 hover:text-white">Log out</button>
          </div>
        </div>
      </aside>

      {/* Mobile / tablet topbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0E1116]/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/dashboard" className="text-xl font-extrabold tracking-tight text-white">
            Stati<span className="text-accent">Q</span>
            <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 align-middle text-[11px] font-semibold text-accent">Hiring</span>
          </Link>
          <button
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            Menu
          </button>
        </div>
        {open && (
          <div className="space-y-2 border-t border-white/10 px-4 py-4 text-sm">
            <NavLink to="/dashboard" end onClick={() => setOpen(false)} className="block text-neutral-200">📊 Dashboard</NavLink>
            <NavLink to="/post-job" onClick={() => setOpen(false)} className="block text-neutral-200">＋ Post a job</NavLink>
            <NavLink to="/jobs" onClick={() => setOpen(false)} className="block text-neutral-200">👁 Preview listings</NavLink>
            <NavLink to="/profile" onClick={() => setOpen(false)} className="block text-neutral-200">🏢 Company profile</NavLink>
            <button onClick={out} className="block text-neutral-400">Log out</button>
          </div>
        )}
      </header>
    </>
  );
}
