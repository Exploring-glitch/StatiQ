import { useState } from 'react';
import { api } from '../lib/api';
import { useToast } from './Toast';

// Résumé link that downloads via the authed endpoint. Server blocks public
// /uploads/resumes/* (403), so a plain <a href> no longer works — this
// fetches with the Bearer token and opens the file as a blob URL.
// External https:// links open directly (no auth needed).
export default function ResumeLink({ url, name, className = 'text-accent hover:underline', children }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const open = async (e) => {
    e.preventDefault();
    if (!url || busy) return;
    if (/^https?:\/\//i.test(url)) {
      window.open(url, '_blank', 'noreferrer');
      return;
    }
    setBusy(true);
    try {
      const { direct, blobUrl } = await api.downloadResume(url);
      window.open(direct || blobUrl, '_blank', 'noreferrer');
    } catch (err) {
      toast?.notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={open} disabled={busy} className={className}>
      {busy ? 'Opening…' : (children || name || 'Résumé ↗')}
    </button>
  );
}
