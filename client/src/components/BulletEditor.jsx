import { useRef, useState } from 'react';
import { countListItems, flattenListItems, groupListItems, splitListItems } from '../lib/lists';

const inputCls = 'w-full rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/60';
const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500';

// A headed group: bold heading with its own indented bullets, an inline row
// to add more points under it, and per-point Edit / Remove.
function GroupCard({ group, canAdd, onChange, onDelete }) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  const addSub = () => {
    const v = draft.trim().replace(/\s+/g, ' ');
    if (!v || !canAdd) return;
    onChange({ ...group, points: [...group.points, v] });
    setDraft('');
  };
  const removeSub = (i) => onChange({ ...group, points: group.points.filter((_, j) => j !== i) });
  // Fix a typo: load the point back into this card's input for re-adding.
  const editSub = (i) => {
    setDraft(group.points[i] || '');
    removeSub(i);
    inputRef.current?.focus();
  };

  return (
    <div className="rounded-lg border border-accent/25 bg-panel2">
      <div className="flex items-center gap-2 px-3 pt-2.5">
        <span className="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
          Heading
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white" title={group.heading}>
          {group.heading}
        </p>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${group.heading} and its points`}
          title="Delete this heading and its points"
          className="shrink-0 text-xs text-neutral-500 hover:text-red-400"
        >
          ✕
        </button>
      </div>
      {group.points.length > 0 && (
        <ul className="space-y-1.5 px-3 py-2">
          {group.points.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span aria-hidden="true" className="mt-0.5 font-bold text-accent">•</span>
              <span className="min-w-0 flex-1 break-words text-neutral-200">{p}</span>
              <button
                type="button"
                onClick={() => editSub(i)}
                aria-label={`Edit point ${i + 1} under ${group.heading}`}
                title="Edit this point"
                className="shrink-0 text-xs text-neutral-500 hover:text-accent"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => removeSub(i)}
                aria-label={`Remove point ${i + 1} under ${group.heading}`}
                title="Remove this point"
                className="shrink-0 text-xs text-neutral-500 hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2 px-3 pb-3 pt-1">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSub();
            }
          }}
          placeholder="Add a point under this heading…"
          maxLength={500}
          aria-label={`Add a point under ${group.heading}`}
          className={`${inputCls} py-1.5 text-[13px]`}
        />
        <button
          type="button"
          onClick={addSub}
          disabled={!draft.trim() || !canAdd}
          className="shrink-0 rounded-md border border-white/15 px-3 text-xs text-white hover:border-accent disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// One-by-one bullet editor for job-post list fields (responsibilities,
// requirements, nice-to-haves, benefits, interview rounds). Two flavours:
// plain points (input + Add, each its own bullet) and headed groups
// ("Compensation & Equity:" + sub-bullets). Items are kept grouped; the
// parent flattens them for the API on save.
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
  const [bulk, setBulk] = useState('');
  // Headed-group composer: { heading, points, draft } or null when closed.
  const [composer, setComposer] = useState(null);
  const inputRef = useRef(null);
  const total = countListItems(items);
  const full = total >= max;

  const add = () => {
    const v = draft.trim().replace(/\s+/g, ' ');
    if (!v || full) return;
    onChange([...items, v]);
    setDraft('');
  };

  const removeAt = (i) => onChange(items.filter((_, j) => j !== i));

  // Fix a typo: load the point back into the input for re-adding.
  const editAt = (i) => {
    setDraft(String(items[i] ?? ''));
    onChange(items.filter((_, j) => j !== i));
    inputRef.current?.focus();
  };

  // Pasting a whole JD: split on blank lines, numbers or bullets. Lines
  // ending in ":" become headings with the lines below them as sub-points.
  const addBulk = () => {
    const additions = groupListItems(splitListItems(bulk, max), max);
    if (!additions.length) return;
    onChange(groupListItems(flattenListItems([...items, ...additions], max), max));
    setBulk('');
  };

  // Headed-group composer helpers (create mode).
  const openComposer = () => {
    if (full) return;
    setComposer({ heading: '', points: [], draft: '' });
  };
  const addStaged = () => {
    if (!composer) return;
    const v = composer.draft.trim().replace(/\s+/g, ' ');
    if (!v) return;
    setComposer({ ...composer, points: [...composer.points, v], draft: '' });
  };
  const saveComposer = () => {
    if (!composer) return;
    const heading = composer.heading.trim().replace(/\s+/g, ' ');
    if (!heading) return;
    const need = 1 + composer.points.length;
    if (total + need > max) return;
    onChange([...items, { heading, points: composer.points }]);
    setComposer(null);
  };

  const inputId = `${id}-input`;

  return (
    <div>
      <label htmlFor={inputId} className={labelCls}>
        {label}
        {total > 0 && (
          <span className="ml-2 font-normal normal-case tracking-normal text-neutral-500">
            · {total} point{total === 1 ? '' : 's'}
          </span>
        )}
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          ref={inputRef}
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
          disabled={!draft.trim() || full}
          className="shrink-0 rounded-md bg-accent px-4 text-sm font-semibold text-white hover:bg-accentHover disabled:opacity-40"
        >
          Add
        </button>
      </div>
      {hint ? <p className="mt-1 text-[11px] text-neutral-500">{hint}</p> : null}
      {!composer ? (
        <button
          type="button"
          onClick={openComposer}
          disabled={full}
          title="Group related points under a bold heading, e.g. Compensation & Equity"
          className="mt-1.5 w-full rounded-md border border-dashed border-white/20 px-3 py-2 text-center text-xs text-neutral-300 hover:border-accent hover:text-white disabled:opacity-40"
        >
          ＋ Heading with sub-points
        </button>
      ) : (
        <div className="mt-1.5 rounded-lg border border-accent/40 bg-accent/5 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-accent">New headed group</p>
          <input
            value={composer.heading}
            onChange={(e) => setComposer({ ...composer, heading: e.target.value })}
            placeholder="Heading — e.g. Compensation & Equity"
            maxLength={120}
            aria-label="Group heading"
            className={`${inputCls} mt-2 font-semibold`}
          />
          <div className="mt-2 flex gap-2">
            <input
              value={composer.draft}
              onChange={(e) => setComposer({ ...composer, draft: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addStaged();
                }
              }}
              placeholder="A point under this heading, then Add"
              maxLength={500}
              aria-label="Stage a point under this heading"
              className={`${inputCls} py-1.5 text-[13px]`}
            />
            <button
              type="button"
              onClick={addStaged}
              disabled={!composer.draft.trim()}
              className="shrink-0 rounded-md border border-white/15 px-3 text-xs text-white hover:border-accent disabled:opacity-40"
            >
              Add
            </button>
          </div>
          {composer.points.length > 0 && (
            <ul className="mt-2 space-y-1">
              {composer.points.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px]">
                  <span aria-hidden="true" className="mt-0.5 font-bold text-accent">•</span>
                  <span className="min-w-0 flex-1 break-words text-neutral-200">{p}</span>
                  <button
                    type="button"
                    onClick={() => setComposer({ ...composer, points: composer.points.filter((_, j) => j !== i) })}
                    aria-label={`Remove staged point ${i + 1}`}
                    className="shrink-0 text-xs text-neutral-500 hover:text-red-400"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2.5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setComposer(null)}
              className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-neutral-300 hover:border-accent hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveComposer}
              disabled={!composer.heading.trim() || total + 1 + composer.points.length > max}
              title={total + 1 + composer.points.length > max ? `Only ${max - total} more lines fit (30 max)` : 'Save this headed group'}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accentHover disabled:opacity-40"
            >
              Save group
            </button>
          </div>
        </div>
      )}
      <details className="mt-1.5">
        <summary className="cursor-pointer text-[11px] text-neutral-500 hover:text-white">
          …or paste many points at once (lines ending with : become headings)
        </summary>
        <textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder={'Paste lines, 1. 2. 3. or • bullets — each becomes its own point'}
          rows={3}
          className={`${inputCls} mt-1.5 resize-y`}
        />
        <button
          type="button"
          onClick={addBulk}
          disabled={!bulk.trim() || full}
          className="mt-1.5 rounded-md border border-white/15 px-3 py-1.5 text-xs text-white hover:border-accent disabled:opacity-40"
        >
          Add all
        </button>
      </details>
      {items.length > 0 ? (
        <div className="mt-2 space-y-1.5">
          {items.map((item, i) =>
            typeof item === 'string' ? (
              <div
                key={i}
                className="flex items-start gap-2 rounded-md border border-white/10 bg-panel2 px-3 py-2 text-sm"
              >
                <span aria-hidden="true" className="mt-0.5 font-bold text-accent">•</span>
                <span className="min-w-0 flex-1 break-words text-neutral-200">{item}</span>
                <button
                  type="button"
                  onClick={() => editAt(i)}
                  aria-label={`Edit point ${i + 1}`}
                  title="Edit this point"
                  className="shrink-0 text-xs text-neutral-500 hover:text-accent"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label={`Remove point ${i + 1}`}
                  title="Remove this point"
                  className="shrink-0 text-xs text-neutral-500 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ) : (
              <GroupCard
                key={i}
                group={item}
                canAdd={!full}
                onChange={(next) => onChange(items.map((x, j) => (j === i ? next : x)))}
                onDelete={() => removeAt(i)}
              />
            ),
          )}
        </div>
      ) : (
        <p className="mt-1.5 text-[11px] text-neutral-600">No points yet — add them one by one above.</p>
      )}
    </div>
  );
}
