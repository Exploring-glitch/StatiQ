import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../components/ProtectedRoute';
import { fileUrl } from '../lib/api';

// Dedicated logout confirmation page — always centered in the viewport,
// never attached to the navbar. Dark-theme card matching the site
// (rounded-xl border border-white/10 bg-panel, accent primary action).
export default function LogoutPage() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const cancel = () => {
    if (window.history.length > 1) nav(-1);
    else nav(user ? roleHome(user) : '/');
  };

  const confirm = () => {
    logout();
    nav('/');
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') cancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div
        role="alertdialog"
        aria-modal="false"
        aria-labelledby="logout-title"
        aria-describedby="logout-desc"
        className="w-full max-w-[400px] rounded-xl border border-white/10 bg-panel p-6 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/20 text-lg font-bold text-accent">
            {user?.avatarUrl ? (
              <img src={fileUrl(user.avatarUrl)} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-white">{user?.name || 'Your account'}</p>
            {user?.email && <p className="truncate text-[13px] text-neutral-400">{user.email}</p>}
          </div>
        </div>

        <h1 id="logout-title" className="mt-5 text-[18px] font-semibold tracking-tight text-white">
          Log out of StatiQ?
        </h1>
        <p id="logout-desc" className="mt-1.5 text-[14px] leading-relaxed text-neutral-400">
          Are you sure you want to log out? You can always log back in at any time.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={cancel}
            autoFocus
            className="flex-1 rounded-md border border-white/15 px-4 py-2.5 text-sm font-medium text-white hover:border-accent hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            className="flex-1 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accentHover"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
