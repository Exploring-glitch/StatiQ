import { logos } from '../data/mock';

export default function LogoMarquee() {
  const row = [...logos, ...logos];
  return (
    <section className="border-y border-white/10 bg-[#0E1114] py-8">
      <p className="text-center text-sm text-neutral-400">
        The teams building what&apos;s next hire on <span className="font-semibold text-white">StatiQ</span>.
      </p>
      <div className="relative mt-5 overflow-hidden">
        <div className="animate-marquee flex w-max gap-3">
          {row.map((logo, i) => (
            <span
              key={i}
              className="rounded-md border border-white/10 bg-panel px-5 py-2.5 text-sm font-semibold text-neutral-300"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-neutral-500">+ 27,000 more startups hiring on StatiQ today</p>
    </section>
  );
}
