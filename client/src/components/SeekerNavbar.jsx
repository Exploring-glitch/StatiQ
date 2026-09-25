import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fileUrl } from '../lib/api';
import NotificationBell from './NotificationBell';

const link = ({ isActive }) =>
  `rounded-full px-3 py-1.5 text-sm transition ${
    isActive ? 'bg-accent font-semibold text-white' : 'text-neutral-400 hover:text-white'
  }`;

// ── Job-seeker shell header: job-board style top nav ──
// Visible only to role=jobseeker (and admin). No employer links at all.
export default function SeekerNavbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenu(false); };
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [menu]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-4">
          <Link to="/jobs" className="text-xl font-extrabold tracking-tight text-white">
            Stati<span className="text-accent">Q</span>
          </Link>
          <span className="hidden rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 lg:inline">
            ● For job seekers
          </span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/jobs" end className={link}>Find jobs</NavLink>
          <NavLink to="/companies" className={link}>Companies</NavLink>
          <NavLink to="/my-applications" className={link}>My applications</NavLink>
          <NavLink to="/saved" className={link}>Saved</NavLink>
        </nav>

        <div className="relative hidden items-center gap-3 md:flex" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenu(!menu)}
            aria-haspopup="menu"
            aria-expanded={menu}
            className="flex items-center gap-2 rounded-full border border-white/15 py-1 pl-1 pr-3 text-sm text-white hover:border-accent"
          >
            <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-accent/20 text-xs font-bold text-accent">
              {user?.avatarUrl ? (
                <img src={fileUrl(user.avatarUrl)} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                (user?.name || '?').charAt(0).toUpperCase()
              )}
              {user?.openToWork !== false && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink bg-emerald-500" />
              )}
            </span>
            {user?.name?.split(' ')[0] || 'Profile'}
            <span aria-hidden="true" className="text-xs text-neutral-500">▾</span>
          </button>
          {menu && (
            <div role="menu" className="absolute right-0 top-10 w-44 rounded-lg border border-white/10 bg-panel2 p-1 shadow-2xl">
              <Link role="menuitem" to="/profile" onClick={() => setMenu(false)} className="block rounded-md px-3 py-2 text-sm text-neutral-200 hover:bg-white/5 hover:text-white">Profile</Link>
              <Link role="menuitem" to="/logout" onClick={() => setMenu(false)} className="block rounded-md px-3 py-2 text-sm text-neutral-400 hover:bg-white/5 hover:text-white">Log out</Link>
            </div>
          )}
        </div>

        <button
          className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="space-y-2 border-t border-white/10 bg-ink px-4 py-4 text-sm md:hidden">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">For job seekers</p>
          <NavLink to="/jobs" end onClick={() => setOpen(false)} className="block text-neutral-200">Find jobs</NavLink>
          <NavLink to="/companies" onClick={() => setOpen(false)} className="block text-neutral-200">Companies</NavLink>
          <NavLink to="/my-applications" onClick={() => setOpen(false)} className="block text-neutral-200">My applications</NavLink>
          <NavLink to="/saved" onClick={() => setOpen(false)} className="block text-neutral-200">Saved</NavLink>
          <Link to="/profile" onClick={() => setOpen(false)} className="block font-semibold text-accent">Profile →</Link>
          <Link to="/logout" onClick={() => setOpen(false)} className="block text-neutral-400">Log out</Link>
        </div>
      )}
    </header>
  );
}
