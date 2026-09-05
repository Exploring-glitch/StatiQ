import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-sm font-bold text-accent">404</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Page not found</h1>
      <p className="mt-2 text-sm text-slate-400">That route doesn&apos;t exist yet.</p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-base">
        Go home →
      </Link>
    </section>
  );
}
