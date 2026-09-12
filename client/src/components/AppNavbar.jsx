import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Logged-in app header (Wellfound-style): no marketing nav, no footer
// Logout goes to the dedicated centered /logout confirmation page.
export default function AppNavbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to={user?.role === 'employer' ? '/dashboard' : '/jobs'} className="text-xl font-extrabold tracking-tight text-white">
          Stati<span className="text-accent">Q</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-neutral-400 md:flex">
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
          <Link to="/logout" className="text-sm text-neutral-400 hover:text-white">Log out</Link>
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
          <Link to="/jobs" onClick={() => setOpen(false)} className="block text-neutral-300">Jobs</Link>
          {user?.role === 'employer' && (
            <>
              <Link to="/post-job" onClick={() => setOpen(false)} className="block text-neutral-300">Post a job</Link>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-neutral-300">Dashboard</Link>
            </>
          )}
          {(user?.role === 'jobseeker' || user?.role === 'admin') && (
            <>
              <Link to="/my-applications" onClick={() => setOpen(false)} className="block text-neutral-300">My applications</Link>
              <Link to="/saved" onClick={() => setOpen(false)} className="block text-neutral-300">Saved</Link>
            </>
          )}
          <Link to="/profile" onClick={() => setOpen(false)} className="block font-semibold text-accent">Profile →</Link>
          <Link to="/logout" onClick={() => setOpen(false)} className="block text-neutral-400">Log out</Link>
        </div>
      )}
    </header>
  );
}
