import { Link } from 'react-router-dom';

export default function SignupPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Free to join
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Join StatiQ.</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">
          One platform, two doors. Pick yours — set up in under two minutes.
        </p>
      </div>

      <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
        <Link
          to="/signup/job"
          className="group rounded-2xl border border-white/10 bg-panel p-6 transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/10 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-xl" aria-hidden="true">
              ◎
            </span>
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent">
              Free forever
            </span>
          </div>
          <p className="mt-4 text-lg font-bold text-white">
            I&apos;m looking for a job{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </p>
          <p className="mt-1 text-sm text-neutral-400">Create a seeker account and get discovered by 27,000+ startups.</p>
          <ul className="mt-4 space-y-1.5 border-t border-white/5 pt-4 text-xs text-neutral-500">
            <li>✓ One profile, thousands of founders</li>
            <li>✓ Apply in one click</li>
          </ul>
        </Link>

        <Link
          to="/signup/hire"
          className="group rounded-2xl border border-white/10 bg-panel p-6 transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/10 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/15 text-xl" aria-hidden="true">
              ◈
            </span>
            <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              Post free
            </span>
          </div>
          <p className="mt-4 text-lg font-bold text-white">
            I&apos;m looking to hire{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </p>
          <p className="mt-1 text-sm text-neutral-400">Create an employer account and reach 10M+ candidates.</p>
          <ul className="mt-4 space-y-1.5 border-t border-white/5 pt-4 text-xs text-neutral-500">
            <li>✓ Unlimited posts + built-in ATS, $0</li>
            <li>✓ 5–10 qualified candidates / week</li>
          </ul>
        </Link>
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-panel/60 px-4 py-3 text-center text-xs text-neutral-400">
        Have an account?{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Log in
        </Link>{' '}
        <span className="mx-1 text-neutral-600">·</span> Trusted by 27,000+ startups
      </div>
    </section>
  );
}
