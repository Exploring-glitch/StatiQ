import { useEffect, useRef, useState } from 'react';

export const WHY_MIN = 50;
export const WHY_MAX = 2000;

// Application dialog: the required "Why do you want to join {company}?"
// answer. Calls onSubmit(note) and surfaces its own busy state; submit
// stays disabled until the answer meets the minimum length.
export default function ApplyModal({ company, role, busy, error, onClose, onSubmit }) {
  const [note, setNote] = useState('');
  const boxRef = useRef(null);
  const len = note.trim().length;
  const valid = len >= WHY_MIN;

  useEffect(() => {
    boxRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-white/10 bg-panel p-6 shadow-2xl"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Apply</p>
        <h2 id="apply-title" className="mt-1 text-lg font-bold text-white">
          Why do you want to join {company || 'this company'}?
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          {role} · Tell the hiring team what excites you about their mission, product, or work. Minimum {WHY_MIN} characters.
        </p>
        <textarea
          ref={boxRef}
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, WHY_MAX))}
          rows={5}
          placeholder={`e.g. I want to join ${company || 'you'} because…`}
          className="mt-3 w-full resize-y rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/60"
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className={valid ? 'text-emerald-400' : 'text-neutral-500'}>
            {len}/{WHY_MAX}{valid ? ' ✓' : ` · ${WHY_MIN - len} more to go`}
          </span>
        </div>
        {error && <p className="mt-2 rounded-md bg-red-500/10 p-2 text-xs text-red-400">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-white/15 px-4 py-2 text-sm text-white hover:border-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!valid || busy}
            onClick={() => onSubmit(note.trim())}
            className="flex-1 rounded-md bg-[#f4f4f5] px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-300 disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send application →'}
          </button>
        </div>
      </div>
    </div>
  );
}
