import { logos } from '../data/mock';

export default function LogoMarquee() {
  const row = [...logos, ...logos];
  return (
    <section className="border-y border-white/10 bg-surface/50 py-8">
      <p className="text-center text-sm text-slate-400">
        The teams building what&apos;s next hire on <span className="font-semibold text-white">StatiQ</span>.
      </p>
      <div className="relative mt-5 overflow-hidden">
        <div className="animate-marquee flex w-max gap-3">
          {row.map((logo, i) => (
            <span
              key={i}
              className="rounded-md border border-white/10 bg-card px-5 py-2.5 text-sm font-semibold text-slate-200"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">+ 27,000 more startups hiring on StatiQ today</p>
    </section>
  );
}
