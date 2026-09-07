import { testimonials } from '../data/mock';

export default function Testimonials() {
  return (
    <section className="border-y border-white/10 bg-[#0E1114]">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Hired on StatiQ</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Jobs found. Teams built.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <figure key={i} className="rounded-xl border border-white/10 bg-panel p-5">
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">{t.type}</span>
              <blockquote className="mt-3 text-sm text-neutral-300">“{t.text}”</blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
