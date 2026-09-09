import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function EmployerSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({ name, email, password, role: 'employer', company });
      nav('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-5xl gap-0 px-4 py-10 md:grid-cols-2">
      <div className="hidden rounded-l-2xl border border-neutral-200 bg-white p-8 md:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Employers — post free</p>
        <h2 className="mt-3 text-2xl font-bold text-neutral-900">Start hiring in minutes.</h2>
        <ul className="mt-4 space-y-2 text-sm text-neutral-500">
          <li>✓ Unlimited posts + built-in ATS, $0</li>
          <li>✓ AI sourcing + dedicated recruiters</li>
          <li>✓ 5–10 qualified candidates / week</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-[#F4F4F2] p-8 md:rounded-l-none">
        <h1 className="text-xl font-bold text-neutral-900">Create employer account</h1>
        <form className="mt-4 space-y-3" onSubmit={submit}>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900" />
          <input value={company} onChange={(e) => setCompany(e.target.value)} required placeholder="Company name" className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="Work email" className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" minLength={8} placeholder="Password (8+ chars)" className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900" />
          {error && <p className="rounded-md bg-red-500/10 p-2 text-xs text-red-600">{error}</p>}
          <button disabled={busy} className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60">
            {busy ? 'Creating…' : 'Start hiring →'}
          </button>
        </form>
        <p className="mt-3 text-center text-xs text-neutral-400">
          Have an account? <Link to="/login/hire" className="text-accent">Log in</Link> · Looking for a job?{' '}
          <Link to="/signup/job" className="text-accent">Seeker sign up</Link>
        </p>
      </div>
    </section>
  );
}
