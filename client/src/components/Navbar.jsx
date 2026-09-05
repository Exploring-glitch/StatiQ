import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-base/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="#" className="text-xl font-800 font-extrabold tracking-tight text-white">
          Stati<span className="text-accent">Q</span>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="#companies" className="hover:text-white">For companies</a>
          <a href="#candidates" className="hover:text-white">For job seekers</a>
          <a href="#faq" className="hover:text-white">Blog</a>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a href="#" className="text-sm text-slate-300 hover:text-white">Log in</a>
          <a href="#cta" className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white hover:border-accent">
            Sign up
          </a>
          <a href="#candidates" className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-base hover:bg-accentHover">
            I&apos;m looking for a job
          </a>
          <a href="#companies" className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-base hover:bg-slate-200">
            I&apos;m hiring
          </a>
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
          <a href="#companies" className="block text-slate-200">For companies</a>
          <a href="#candidates" className="block text-slate-200">For job seekers</a>
          <a href="#faq" className="block text-slate-200">Blog</a>
          <a href="#" className="block text-slate-200">Log in</a>
          <a href="#cta" className="block font-semibold text-accent">Sign up →</a>
        </div>
      )}
    </header>
  );
}
