import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Logged-in app header (Wellfound-style): no marketing nav, no footer
export default function AppNavbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const out = () => {
    logout();
    setOpen(false);
    nav('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-base/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to={user?.role === 'employer' ? '/post-job' : '/jobs'} className="text-xl font-extrabold tracking-tight text-white">
          Stati<span className="text-accent">Q</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
          <Link to="/jobs" className="hover:text-white">Jobs</Link>
          {user?.role === 'employer' && (
            <>
              <Link to="/post-job" className="hover:text-white">Post a job</Link>
              <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            </>
          )}
          {(user?.role === 'jobseeker' || user?.role === 'admin') && (
            <>
              <Link to="/my-applications" className="hover:text-white">My applications</Link>
              <Link to="/saved" className="hover:text-white">Saved</Link>
            </>
          )}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-sm text-white hover:border-accent"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
              {(user?.name || '?').charAt(0).toUpperCase()}
            </span>
            {user?.name?.split(' ')[0]}
          </Link>
          <button onClick={out} className="text-sm text-slate-400 hover:text-white">Log out</button>
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
        <div className="space-y-2 border-t border-white/10 px-4 py-4 text-sm md:hidden">
          <Link to="/jobs" onClick={() => setOpen(false)} className="block text-slate-200">Jobs</Link>
          {user?.role === 'employer' && (
            <>
              <Link to="/post-job" onClick={() => setOpen(false)} className="block text-slate-200">Post a job</Link>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-slate-200">Dashboard</Link>
            </>
          )}
          {(user?.role === 'jobseeker' || user?.role === 'admin') && (
            <>
              <Link to="/my-applications" onClick={() => setOpen(false)} className="block text-slate-200">My applications</Link>
              <Link to="/saved" onClick={() => setOpen(false)} className="block text-slate-200">Saved</Link>
            </>
          )}
          <Link to="/profile" onClick={() => setOpen(false)} className="block font-semibold text-accent">Profile →</Link>
          <button onClick={out} className="block text-slate-400">Log out</button>
        </div>
      )}
    </header>
  );
}
