import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const out = () => {
    logout();
    setOpen(false);
    nav('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-base/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-white">
          Stati<span className="text-accent">Q</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link to="/for-companies" className="hover:text-white">For companies</Link>
          <Link to="/for-job-seekers" className="hover:text-white">For job seekers</Link>
          <Link to="/jobs" className="hover:text-white">Jobs</Link>
          {user?.role === 'employer' && <Link to="/post-job" className="text-accent hover:text-white">Post a job</Link>}
          {user?.role === 'jobseeker' && <Link to="/my-applications" className="text-accent hover:text-white">My applications</Link>}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-slate-300">Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={out} className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white hover:border-accent">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-300 hover:text-white">Log in</Link>
              <Link to="/signup" className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white hover:border-accent">
                Sign up
              </Link>
              <Link to="/signup/job" className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-base hover:bg-accentHover">
                I&apos;m looking for a job
              </Link>
              <Link to="/signup/hire" className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-base hover:bg-slate-200">
                I&apos;m hiring
              </Link>
            </>
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
        <div className="space-y-2 border-t border-white/10 px-4 py-4 text-sm md:hidden">
          <Link to="/for-companies" onClick={() => setOpen(false)} className="block text-slate-200">For companies</Link>
          <Link to="/for-job-seekers" onClick={() => setOpen(false)} className="block text-slate-200">For job seekers</Link>
          <Link to="/jobs" onClick={() => setOpen(false)} className="block text-slate-200">Jobs</Link>
          {user?.role === 'employer' && <Link to="/post-job" onClick={() => setOpen(false)} className="block text-accent">Post a job</Link>}
          {user?.role === 'jobseeker' && <Link to="/my-applications" onClick={() => setOpen(false)} className="block text-accent">My applications</Link>}
          {user ? (
            <button onClick={out} className="block text-slate-200">Log out ({user.name})</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block text-slate-200">Log in</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="block font-semibold text-accent">Sign up →</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
