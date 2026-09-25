import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { timeAgo, useNow } from '../lib/time';

export default function NotificationsPage() {
  const now = useNow();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listNotifications({ unreadOnly: filter === 'unread' ? 'true' : '', limit: 50 });
      setItems(data.items || []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const markRead = async (n) => {
    const id = n._id || n.id;
    try {
      await api.markNotificationRead(id);
      setItems((prev) => prev.map((x) => ((x._id || x.id) === id ? { ...x, read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* keep unread */ }
  };

  const markAll = async () => {
    try {
      await api.markAllNotificationsRead();
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const remove = async (n) => {
    const id = n._id || n.id;
    setItems((prev) => prev.filter((x) => (x._id || x.id) !== id));
    try {
      await api.deleteNotification(id);
    } catch {
      load();
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Inbox</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-white">
          Notifications {unreadCount > 0 && <span className="rounded-full bg-accent/15 px-2 py-0.5 align-middle text-sm text-accent">{unreadCount} new</span>}
        </h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setFilter('all')} className={`rounded-full px-3 py-1 text-xs ${filter === 'all' ? 'bg-accent/15 text-accent' : 'text-neutral-400'}`}>All</button>
          <button type="button" onClick={() => setFilter('unread')} className={`rounded-full px-3 py-1 text-xs ${filter === 'unread' ? 'bg-accent/15 text-accent' : 'text-neutral-400'}`}>Unread</button>
          <button type="button" onClick={markAll} className="rounded-md border border-white/15 px-3 py-1 text-xs text-white hover:border-accent">Mark all read</button>
        </div>
      </div>
      {loading && <p className="mt-6 text-sm text-neutral-400">Loading…</p>}
      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-400">
          <p className="min-w-0 flex-1">{error}</p>
          <button type="button" onClick={load} className="rounded border border-red-400/40 px-2 py-0.5 text-xs">Retry</button>
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="mt-6 rounded-xl border border-white/10 bg-panel p-6 text-sm text-neutral-400">
          No notifications yet. <Link to="/jobs" className="text-accent">Browse jobs →</Link>
        </p>
      )}
      <div className="mt-6 space-y-3">
        {items.map((n) => (
          <div key={n._id || n.id} className={`rounded-xl border p-4 ${n.read ? 'border-white/10 bg-panel' : 'border-accent/30 bg-accent/5'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{n.title}</p>
                {n.body && <p className="mt-1 text-xs text-neutral-400">{n.body}</p>}
                {n.createdAt && <p className="mt-1 text-[11px] text-neutral-600">{timeAgo(n.createdAt, 'Received', now).toLowerCase()}</p>}
              </div>
              {!n.read && <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">new</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {n.link && <Link to={n.link} className="rounded-md bg-[#f4f4f5] px-3 py-1 text-xs font-semibold text-black hover:bg-neutral-300">Open →</Link>}
              {!n.read && <button type="button" onClick={() => markRead(n)} className="rounded-md border border-white/15 px-3 py-1 text-xs text-white hover:border-accent">Mark read</button>}
              <button type="button" onClick={() => remove(n)} className="rounded-md border border-white/15 px-3 py-1 text-xs text-neutral-400 hover:border-red-500 hover:text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
