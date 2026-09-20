import { Link, useSearchParams } from 'react-router-dom';

export default function LoginPage() {
  const [params] = useSearchParams();
  const next = params.get('next') || '';
  const qs = (base) => (next ? `${base}?next=${encodeURIComponent(next)}` : base);

  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Secure sign-in
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Welcome back.</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">
          Choose how you use StatiQ to continue — your workspace picks up right where you left off.
        </p>
      </div>

      <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
        <Link
          to={qs('/login/job')}
          className="group rounded-2xl border border-white/10 bg-panel p-6 transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/10 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-xl" aria-hidden="true">
              ◎
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">Job seekers</span>
          </div>
          <p className="mt-4 text-lg font-bold text-white">
            Log in to find work{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </p>
          <p className="mt-1 text-sm text-neutral-400">Apply in one click, track applications, get discovered.</p>
          <ul className="mt-4 space-y-1.5 border-t border-white/5 pt-4 text-xs text-neutral-500">
            <li>✓ 27,000+ startups hiring now</li>
            <li>✓ Salary + equity up front</li>
          </ul>
        </Link>

        <Link
          to={qs('/login/hire')}
          className="group rounded-2xl border border-white/10 bg-panel p-6 transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/10 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/15 text-xl" aria-hidden="true">
              ◈
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Employers</span>
          </div>
          <p className="mt-4 text-lg font-bold text-white">
            Log in to hire{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </p>
          <p className="mt-1 text-sm text-neutral-400">Post jobs, review applicants, manage your pipeline.</p>
          <ul className="mt-4 space-y-1.5 border-t border-white/5 pt-4 text-xs text-neutral-500">
            <li>✓ Unlimited free posts + built-in ATS</li>
            <li>✓ 10M+ startup-minded candidates</li>
          </ul>
        </Link>
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-panel/60 px-4 py-3 text-center text-xs text-neutral-400">
        No account?{' '}
        <Link to="/signup" className="font-semibold text-accent hover:underline">
          Create one free
        </Link>{' '}
        <span className="mx-1 text-neutral-600">·</span> No credit card required
      </div>
    </section>
  );
}
