import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function JobSeekerSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <section className="mx-auto grid max-w-5xl gap-0 px-4 py-10 md:grid-cols-2">
      <div className="hidden rounded-l-2xl border border-neutral-200 bg-[#F4F4F2] p-8 md:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Job seekers — free forever</p>
        <h2 className="mt-3 text-2xl font-bold text-neutral-900">Get discovered by startups.</h2>
        <ul className="mt-4 space-y-2 text-sm text-neutral-500">
          <li>✓ One profile, thousands of founders</li>
          <li>✓ Salary + equity up front</li>
          <li>✓ Apply in one click</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 md:rounded-l-none">
        <h1 className="text-xl font-bold text-neutral-900">Create seeker account</h1>
        <form className="mt-4 space-y-3" onSubmit={submit}>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="Email" className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" minLength={8} placeholder="Password (8+ chars)" className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900" />
          {error && <p className="rounded-md bg-red-500/10 p-2 text-xs text-red-600">{error}</p>}
          <button disabled={busy} className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60">
            {busy ? 'Creating…' : 'Sign up free →'}
          </button>
        </form>
        <p className="mt-3 text-center text-xs text-neutral-400">
          Have an account? <Link to="/login/job" className="text-accent">Log in</Link> · Hiring?{' '}
          <Link to="/signup/hire" className="text-accent">Employer sign up</Link>
        </p>
      </div>
    </section>
  );
}
