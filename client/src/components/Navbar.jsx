import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
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
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm text-slate-300 hover:text-white">Log in</Link>
          <Link to="/signup" className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white hover:border-accent">
            Sign up
          </Link>
          <Link to="/signup?type=job" className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-base hover:bg-accentHover">
            I&apos;m looking for a job
          </Link>
          <Link to="/signup?type=hire" className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-base hover:bg-slate-200">
            I&apos;m hiring
          </Link>
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
          <Link to="/for-companies" className="block text-slate-200">For companies</Link>
          <Link to="/for-job-seekers" className="block text-slate-200">For job seekers</Link>
          <Link to="/jobs" className="block text-slate-200">Jobs</Link>
          <Link to="/login" className="block text-slate-200">Log in</Link>
          <Link to="/signup" className="block font-semibold text-accent">Sign up →</Link>
        </div>
      )}
    </header>
  );
}
