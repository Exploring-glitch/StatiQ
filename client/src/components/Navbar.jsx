import { useState } from 'react';
import { Link } from 'react-router-dom';

// Public landing navbar — guests only. Logged-in users never see this shell:
// `/` and auth pages bounce them to their role home, and all other pages
// render inside AppLayout (role navbars when logged in).
export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-white">
          Stati<span className="text-accent">Q</span>
        </Link>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm text-neutral-400 hover:text-white">Log in</Link>
          <Link to="/signup" className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white hover:border-accent">
            Sign up
          </Link>
          <Link to="/signup/job" className="rounded-md bg-[#f4f4f5] px-3 py-1.5 text-sm font-semibold text-black hover:bg-neutral-300">
            I&apos;m looking for a job
          </Link>
          <Link to="/signup/hire" className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accentHover">
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
        <div className="space-y-2 border-t border-white/10 bg-ink px-4 py-4 text-sm md:hidden">
          <Link to="/login" onClick={() => setOpen(false)} className="block text-neutral-300">Log in</Link>
          <Link to="/signup" onClick={() => setOpen(false)} className="block text-neutral-300">Sign up</Link>
          <Link to="/signup/job" onClick={() => setOpen(false)} className="block font-semibold text-white">I&apos;m looking for a job →</Link>
          <Link to="/signup/hire" onClick={() => setOpen(false)} className="block font-semibold text-accent">I&apos;m hiring →</Link>
        </div>
      )}
    </header>
  );
}
