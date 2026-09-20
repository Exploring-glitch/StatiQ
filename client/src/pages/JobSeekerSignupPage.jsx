import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const inputCls =
  'w-full rounded-lg border border-white/10 bg-panel2 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-accent/70 focus:ring-2 focus:ring-accent/20';
const labelCls = 'mb-1.5 block text-xs font-semibold text-neutral-300';

export default function JobSeekerSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({ name, email, password, role: 'jobseeker' });
      nav('/jobs', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-2xl shadow-black/40 md:grid-cols-2">
        {/* Value prop panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-accent/25 via-panel to-panel p-8 md:flex">
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
              ◎ Free forever
            </span>
            <h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-white">
              Get discovered
              <br />
              by startups.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              One profile puts you in front of thousands of founders hiring right now.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-neutral-300">
              {['One profile, thousands of founders', 'Salary + equity up front', 'Apply in one click, track everything'].map((t) => (
                <li key={t} className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-ink/40 px-3 py-2.5 text-xs">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-[10px] font-bold text-emerald-300">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mt-8 flex items-center gap-3 rounded-xl border border-white/10 bg-ink/50 p-4">
            <div className="flex -space-x-2" aria-hidden="true">
              {['A', 'R', 'S'].map((c) => (
                <span key={c} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-panel bg-accent/25 text-[10px] font-bold text-white">
                  {c}
                </span>
              ))}
            </div>
            <p className="text-[11px] leading-snug text-neutral-400">
              <span className="font-semibold text-white">12,000+ seekers</span> joined this month
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div className="p-6 sm:p-8">
          <h1 className="text-xl font-extrabold tracking-tight text-white">Create seeker account</h1>
          <p className="mt-1 text-sm text-neutral-400">Free forever. Set up in under two minutes.</p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
              <label htmlFor="seeker-name" className={labelCls}>
                Full name
              </label>
              <input
                id="seeker-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Aarav Sharma"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="seeker-signup-email" className={labelCls}>
                Email address
              </label>
              <input
                id="seeker-signup-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="seeker-signup-password" className={labelCls}>
                Password
              </label>
              <div className="relative">
                <input
                  id="seeker-signup-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type={showPw ? 'text' : 'password'}
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="8+ characters"
                  className={`${inputCls} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-neutral-400 hover:text-white"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-neutral-500">Must be at least 8 characters.</p>
            </div>

            {error && (
              <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs leading-relaxed text-red-300">
                <span aria-hidden="true" className="mt-0.5 font-bold">!</span>
                {error}
              </p>
            )}

            <button
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:bg-accentHover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {busy ? 'Creating…' : 'Sign up free →'}
            </button>
            <p className="text-center text-[11px] leading-relaxed text-neutral-500">
              By signing up you agree to our Terms & Privacy Policy.
            </p>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] text-neutral-600" aria-hidden="true">
            <span className="h-px flex-1 bg-white/10" />
            ALREADY A MEMBER?
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-xs leading-relaxed text-neutral-400">
            Have an account?{' '}
            <Link to="/login/job" className="font-semibold text-accent hover:underline">
              Log in
            </Link>
            <br />
            <span className="text-neutral-500">
              Hiring?{' '}
              <Link to="/signup/hire" className="text-accent hover:underline">
                Employer sign up
              </Link>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
