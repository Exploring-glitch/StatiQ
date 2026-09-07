import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function JobSeekerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/jobs';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login({ email, password });
      nav(next, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-5xl gap-0 px-4 py-10 md:grid-cols-2">
      <div className="hidden rounded-l-2xl border border-neutral-200 bg-[#F4F4F2] p-8 md:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Job seekers</p>
        <h2 className="mt-3 text-2xl font-bold text-neutral-900">Find work that matters.</h2>
        <p className="mt-2 text-sm text-neutral-500">Log in to apply, track applications, and get discovered by 27,000+ startups.</p>
        <div className="mt-6 space-y-2 text-xs text-neutral-500">
          <p className="rounded-md border border-neutral-200 bg-white p-2">● 27,000+ startups hiring now</p>
          <p className="rounded-md border border-neutral-200 bg-white p-2">● Direct line to founders — no middlemen</p>
        </div>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 md:rounded-l-none">
        <h1 className="text-xl font-bold text-neutral-900">Job seeker log in</h1>
        <form className="mt-4 space-y-3" onSubmit={submit}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Email" className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Password" className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900" />
          {error && <p className="rounded-md bg-red-500/10 p-2 text-xs text-red-600">{error}</p>}
          <button disabled={busy} className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60">
            {busy ? 'Logging in…' : 'Log in →'}
          </button>
        </form>
        <p className="mt-3 text-center text-xs text-neutral-400">
          New here? <Link to="/signup/job" className="text-accent">Create seeker account</Link> · Hiring?{' '}
          <Link to={`/login/hire${next !== '/jobs' ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-accent">Employer log in</Link>
        </p>
      </div>
    </section>
  );
}
