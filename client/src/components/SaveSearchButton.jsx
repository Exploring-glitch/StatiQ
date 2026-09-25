import { useState } from 'react';
import { api } from '../lib/api';
import { useToast } from './Toast';

// Captures the current JobsPage URLSearchParams shape and saves it as an alert.
export default function SaveSearchButton({ getQuery, buttonClass }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [matchCount, setMatchCount] = useState(null);

  const preview = async () => {
    try {
      const q = getQuery?.() || {};
      const data = await api.previewAlert(q);
      setMatchCount(data.matchCount ?? null);
    } catch {
      setMatchCount(null);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      toast?.notify('Give this alert a name', 'error');
      return;
    }
    setBusy(true);
    try {
      await api.createAlert({ name: name.trim(), query: getQuery?.() || {} });
      toast?.notify('Job alert saved — we will notify you on new matches', 'success');
      setOpen(false);
      setName('');
    } catch (e) {
      toast?.notify(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) preview();
        }}
        className={buttonClass || 'rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20'}
      >
        🔔 Save search
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-72 rounded-lg border border-white/10 bg-panel2 p-3 shadow-2xl">
          <p className="text-xs font-bold text-white">Get notified on new matches</p>
          {matchCount != null && <p className="mt-1 text-[11px] text-neutral-400">{matchCount} role{matchCount === 1 ? '' : 's'} match right now</p>}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Remote React jobs"
            maxLength={80}
            className="mt-2 w-full rounded-md border border-white/10 bg-panel px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-accent/60"
          />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-md border border-white/15 px-3 py-1.5 text-xs text-neutral-300">
              Cancel
            </button>
            <button type="button" onClick={save} disabled={busy} className="flex-1 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accentHover disabled:opacity-60">
              {busy ? 'Saving…' : 'Save alert'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
