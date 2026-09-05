import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Auth pages: logo-only bar, NO footer (like Wellfound login/signup)
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-base">
      <ScrollToTop />
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-white">
            Stati<span className="text-accent">Q</span>
          </Link>
          <Link to="/" className="text-sm text-slate-400 hover:text-white">← Back to home</Link>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
