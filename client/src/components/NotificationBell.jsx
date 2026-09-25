import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

// Polling bell: cheap MVP without sockets. Refreshes every 60s + on focus.
export default function NotificationBell({ compact = false }) {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const data = await api.listNotifications({ limit: 5 });
      setUnread(data.unreadCount ?? 0);
      setItems(data.items || []);
    } catch {
      // Offline / logged out — bell stays quiet.
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener('focus', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        className={`relative rounded-full border border-white/15 px-3 py-1.5 text-sm text-white hover:border-accent ${compact ? '!px-2' : ''}`}
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-accent px-1 text-center text-[11px] font-bold leading-5 text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-lg border border-white/10 bg-panel2 p-2 shadow-2xl">
          {items.length === 0 && <p className="px-3 py-2 text-xs text-neutral-500">No notifications yet.</p>}
          {items.map((n) => (
            <Link
              key={n._id || n.id}
              to={n.link || '/notifications'}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 hover:bg-white/5"
            >
              <p className={`text-xs font-semibold ${n.read ? 'text-neutral-300' : 'text-white'}`}>
                {!n.read && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />}
                {n.title}
              </p>
              {n.body && <p className="mt-0.5 line-clamp-2 text-[11px] text-neutral-500">{n.body}</p>}
            </Link>
          ))}
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-md bg-accent/15 px-3 py-2 text-center text-xs font-semibold text-accent hover:bg-accent/25"
          >
            View all →
          </Link>
        </div>
      )}
    </div>
  );
}
