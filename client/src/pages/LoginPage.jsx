import { Link, useSearchParams } from 'react-router-dom';

export default function LoginPage() {
  const [params] = useSearchParams();
  const next = params.get('next') || '';
  const qs = (base) => (next ? `${base}?next=${encodeURIComponent(next)}` : base);

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 text-center">
      <h1 className="text-3xl font-bold text-neutral-900">Welcome back.</h1>
      <p className="mt-2 text-sm text-neutral-500">Choose how you use StatiQ to continue.</p>
      <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
        <Link to={qs('/login/job')} className="rounded-xl border border-neutral-200 bg-[#F4F4F2] p-6 hover:border-accent">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Job seekers</p>
          <p className="mt-2 text-lg font-bold text-neutral-900">Log in to find work →</p>
          <p className="mt-1 text-sm text-neutral-500">Apply, track applications, get discovered.</p>
        </Link>
        <Link to={qs('/login/hire')} className="rounded-xl border border-neutral-200 bg-[#F4F4F2] p-6 hover:border-accent">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Employers</p>
          <p className="mt-2 text-lg font-bold text-neutral-900">Log in to hire →</p>
          <p className="mt-1 text-sm text-neutral-500">Post jobs, review applicants, manage pipeline.</p>
        </Link>
      </div>
      <p className="mt-6 text-xs text-neutral-400">
        No account? <Link to="/signup" className="text-accent">Sign up</Link>
      </p>
    </section>
  );
}
