import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Auth pages: minimal professional shell, no footer (like Wellfound login/signup)
export default function AuthLayout() {
  return (
    <div className="relative min-h-screen bg-ink text-neutral-300">
      <ScrollToTop />
      {/* Subtle professional backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_48px] opacity-40" />
      </div>
      <header className="sticky top-0 z-10 border-b border-white/10 bg-ink/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5" aria-label="StatiQ home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accentHover text-sm font-extrabold text-white shadow-lg shadow-accent/25">
              Q
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Stati<span className="text-accent">Q</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-panel px-3 py-1 text-[11px] font-medium text-neutral-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Secure sign-in
            </span>
            <Link
              to="/"
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-neutral-300 transition hover:border-accent hover:text-white"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </header>
      <main className="relative">
        <Outlet />
      </main>
      <p className="relative pb-8 text-center text-[11px] text-neutral-600">
        Protected by secure authentication · © {new Date().getFullYear()} StatiQ
      </p>
    </div>
  );
}
