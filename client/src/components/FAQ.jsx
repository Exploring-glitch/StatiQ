import { useState } from 'react';
import { faqs } from '../data/mock';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-14">
      <h2 className="text-center text-3xl font-bold text-white">Common questions.</h2>
      <div className="mt-8 space-y-3">
        {faqs.map((f, i) => {
          const open = openIdx === i;
          return (
            <div key={i} className="rounded-xl border border-white/10 bg-panel">
              <button
                onClick={() => setOpenIdx(open ? -1 : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-white"
              >
                {f.q}
                <span className="text-accent">{open ? '−' : '+'}</span>
              </button>
              {open && <p className="px-5 pb-5 text-sm text-neutral-400">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
