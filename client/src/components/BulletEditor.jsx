import { useState } from 'react';

const inputCls = 'w-full rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/60';
const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500';

// One-by-one bullet editor for job-post list fields (responsibilities,
// requirements, nice-to-haves, benefits, interview rounds). The employer
// types a single point into the input box, clicks Add (or presses Enter),
// and each point appears below as its own bullet with a remove option.
// Items are kept as an array; the parent serialises them on save.
export default function BulletEditor({
  id,
  label,
  items = [],
  onChange,
  placeholder = 'Type one point, then click Add',
  hint = '',
  max = 30,
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim().replace(/\s+/g, ' ');
    if (!v || items.length >= max) return;
    onChange([...items, v]);
    setDraft('');
  };

  const removeAt = (i) => onChange(items.filter((_, j) => j !== i));

  const inputId = `${id}-input`;

  return (
    <div>
      <label htmlFor={inputId} className={labelCls}>
        {label}
        {items.length > 0 && (
          <span className="ml-2 font-normal normal-case tracking-normal text-neutral-500">
            · {items.length} point{items.length === 1 ? '' : 's'}
          </span>
        )}
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          maxLength={500}
          className={inputCls}
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim() || items.length >= max}
          className="shrink-0 rounded-md bg-accent px-4 text-sm font-semibold text-white hover:bg-accentHover disabled:opacity-40"
        >
          Add
        </button>
      </div>
      {hint ? <p className="mt-1 text-[11px] text-neutral-500">{hint}</p> : null}
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm"
            >
              <span aria-hidden="true" className="mt-0.5 font-bold text-accent">•</span>
              <span className="min-w-0 flex-1 break-words text-neutral-200">{item}</span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove point ${i + 1}`}
                title="Remove this point"
                className="shrink-0 text-xs text-neutral-500 hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-[11px] text-neutral-600">No points yet — add them one by one above.</p>
      )}
    </div>
  );
}
