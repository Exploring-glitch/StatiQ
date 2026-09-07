import { agents } from '../data/mock';

export default function ReachFeature() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Featured · StatiQ Reach</p>
      <h2 className="mt-2 max-w-2xl text-3xl font-bold text-white">Reach the right candidates. Automatically.</h2>
      <p className="mt-3 max-w-2xl text-sm text-neutral-400">
        The agentic recruiting platform that evaluates every candidate, surfaces hidden fits,
        and runs personalized outreach until they reply. Done by AI, guided by you.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {agents.map((a) => (
          <div key={a.name} className="rounded-xl border border-white/10 bg-panel p-5">
            <p className="text-sm font-bold text-white">{a.name}</p>
            <p className="mt-1 text-xs text-emerald-400">● 3 agents working · Live</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-md bg-panel2 p-2"><p className="font-bold text-white">{a.evaluated}</p><p className="text-neutral-500">evaluated</p></div>
              <div className="rounded-md bg-panel2 p-2"><p className="font-bold text-white">{a.matched}</p><p className="text-neutral-500">matched</p></div>
              <div className="rounded-md bg-panel2 p-2"><p className="font-bold text-white">{a.pitched}</p><p className="text-neutral-500">pitched</p></div>
              <div className="rounded-md bg-panel2 p-2"><p className="font-bold text-white">{a.replied}</p><p className="text-neutral-500">replied</p></div>
            </div>
          </div>
        ))}
      </div>
      <a href="#cta" className="mt-6 inline-block rounded-md border border-white/15 px-4 py-2 text-sm text-white hover:border-accent">
        Explore AI candidate sourcing →
      </a>
    </section>
  );
}
