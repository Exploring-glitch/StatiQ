import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section id="cta" className="mx-auto max-w-6xl px-4 pb-14">
      <div className="rounded-2xl border border-white/10 bg-surface p-10 text-center">
        <h2 className="text-3xl font-bold text-white">What&apos;s your next move?</h2>
        <p className="mt-2 text-sm text-slate-400">The right job, or the right hire. Both start here.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/signup?type=job" className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-base hover:bg-accentHover">
            Sign up to find a job →
          </Link>
          <Link to="/for-companies" className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-base hover:bg-slate-200">
            Start hiring
          </Link>
        </div>
      </div>
    </section>
  );
}
