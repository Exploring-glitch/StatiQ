import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function SignupPage() {
  const [params] = useSearchParams();
  const initial = params.get('type') === 'hire' ? 'hire' : 'job';
  const [role, setRole] = useState(initial);
  const nav = useNavigate();

  return (
    <section className="mx-auto grid max-w-5xl gap-0 px-4 py-10 md:grid-cols-2">
      <div className="hidden rounded-l-2xl border border-white/10 bg-surface p-8 md:block">
        <p className="text-xl font-extrabold text-white">Stati<span className="text-accent">Q</span></p>
        <h2 className="mt-6 text-2xl font-bold text-white">Where great companies meet great people.</h2>
        <p className="mt-2 text-sm text-slate-400">One account for jobs and hiring. Free for candidates, free to post.</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-card p-8 md:rounded-l-none">
        <h1 className="text-xl font-bold text-white">Create account</h1>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setRole('job')}
            className={`rounded-md border px-3 py-2 text-sm ${role === 'job' ? 'border-accent bg-accent/15 text-accent' : 'border-white/15 text-white'}`}
          >
            I&apos;m looking for a job
          </button>
          <button
            onClick={() => setRole('hire')}
            className={`rounded-md border px-3 py-2 text-sm ${role === 'hire' ? 'border-accent bg-accent/15 text-accent' : 'border-white/15 text-white'}`}
          >
            I&apos;m looking to hire
          </button>
        </div>
        <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); nav(role === 'hire' ? '/for-companies' : '/jobs'); }}>
          <input required placeholder="Full name" className="w-full rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white" />
          <input required type="email" placeholder="Email" className="w-full rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white" />
          <input required type="password" placeholder="Password (8+ chars)" className="w-full rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white" />
          <button className="w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-base hover:bg-accentHover">
            Sign up →
          </button>
        </form>
        <p className="mt-3 text-center text-xs text-slate-500">
          UI-only demo. Have an account? <Link to="/login" className="text-accent">Log in</Link>
        </p>
      </div>
    </section>
  );
}
