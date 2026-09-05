import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const homeFor = (user) => (user?.role === 'employer' ? '/post-job' : '/jobs');

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login({ email, password });
      nav(next || homeFor(user), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-5xl gap-0 px-4 py-10 md:grid-cols-2">
      <div className="hidden rounded-l-2xl border border-white/10 bg-surface p-8 md:block">
        <p className="text-xl font-extrabold text-white">Stati<span className="text-accent">Q</span></p>
        <h2 className="mt-6 text-2xl font-bold text-white">Welcome back.</h2>
        <p className="mt-2 text-sm text-slate-400">Log in to talk to founders, track applications, and get discovered.</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-card p-8 md:rounded-l-none">
        <h1 className="text-xl font-bold text-white">Log in</h1>
        <form className="mt-4 space-y-3" onSubmit={submit}>
          <input
            value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
            placeholder="Email" className="w-full rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white"
          />
          <input
            value={password} onChange={(e) => setPassword(e.target.value)}
            type="password" required placeholder="Password"
            className="w-full rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white"
          />
          {error && <p className="rounded-md bg-red-500/10 p-2 text-xs text-red-400">{error}</p>}
          <button
            disabled={busy}
            className="w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-base hover:bg-accentHover disabled:opacity-60"
          >
            {busy ? 'Logging in…' : 'Log in →'}
          </button>
        </form>
        <p className="mt-3 text-center text-xs text-slate-500">
          No account? <Link to="/signup" className="text-accent">Sign up</Link>
        </p>
      </div>
    </section>
  );
}
