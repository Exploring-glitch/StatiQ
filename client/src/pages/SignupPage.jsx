import { Link } from 'react-router-dom';

export default function SignupPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14 text-center">
      <h1 className="text-3xl font-bold text-white">Join StatiQ.</h1>
      <p className="mt-2 text-sm text-slate-400">One platform, two doors. Pick yours.</p>
      <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
        <Link to="/signup/job" className="rounded-xl border border-white/10 bg-surface p-6 hover:border-accent">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">I&apos;m looking for a job</p>
          <p className="mt-2 text-lg font-bold text-white">Create seeker account →</p>
          <p className="mt-1 text-sm text-slate-400">Free forever. Get discovered by 27,000+ startups.</p>
        </Link>
        <Link to="/signup/hire" className="rounded-xl border border-white/10 bg-surface p-6 hover:border-accent">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">I&apos;m looking to hire</p>
          <p className="mt-2 text-lg font-bold text-white">Create employer account →</p>
          <p className="mt-1 text-sm text-slate-400">Post jobs free. Reach 10M+ candidates.</p>
        </Link>
      </div>
      <p className="mt-6 text-xs text-slate-500">
        Have an account? <Link to="/login" className="text-accent">Log in</Link>
      </p>
    </section>
  );
}
