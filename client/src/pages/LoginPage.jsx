import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const nav = useNavigate();
  return (
    <section className="mx-auto grid max-w-5xl gap-0 px-4 py-10 md:grid-cols-2">
      <div className="hidden rounded-l-2xl border border-white/10 bg-surface p-8 md:block">
        <p className="text-xl font-extrabold text-white">Stati<span className="text-accent">Q</span></p>
        <h2 className="mt-6 text-2xl font-bold text-white">Welcome back.</h2>
        <p className="mt-2 text-sm text-slate-400">Log in to talk to founders, track applications, and get discovered.</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-card p-8 md:rounded-l-none">
        <h1 className="text-xl font-bold text-white">Log in</h1>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => { e.preventDefault(); nav('/jobs'); }}
        >
          <input
            value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
            placeholder="Email" className="w-full rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white"
          />
          <input type="password" required placeholder="Password" className="w-full rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white" />
          <button className="w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-base hover:bg-accentHover">
            Log in →
          </button>
        </form>
        <p className="mt-3 text-center text-xs text-slate-500">
          UI-only demo — any login goes to /jobs. No account? <Link to="/signup" className="text-accent">Sign up</Link>
        </p>
      </div>
    </section>
  );
}
