import { Link } from 'react-router-dom';

export default function SignupPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14 text-center">
      <h1 className="text-3xl font-bold text-neutral-900">Join StatiQ.</h1>
      <p className="mt-2 text-sm text-neutral-500">One platform, two doors. Pick yours.</p>
      <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
        <Link to="/signup/job" className="rounded-xl border border-neutral-200 bg-[#F4F4F2] p-6 hover:border-accent">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">I&apos;m looking for a job</p>
          <p className="mt-2 text-lg font-bold text-neutral-900">Create seeker account →</p>
          <p className="mt-1 text-sm text-neutral-500">Free forever. Get discovered by 27,000+ startups.</p>
        </Link>
        <Link to="/signup/hire" className="rounded-xl border border-neutral-200 bg-[#F4F4F2] p-6 hover:border-accent">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">I&apos;m looking to hire</p>
          <p className="mt-2 text-lg font-bold text-neutral-900">Create employer account →</p>
          <p className="mt-1 text-sm text-neutral-500">Post jobs free. Reach 10M+ candidates.</p>
        </Link>
      </div>
      <p className="mt-6 text-xs text-neutral-400">
        Have an account? <Link to="/login" className="text-accent">Log in</Link>
      </p>
    </section>
  );
}
