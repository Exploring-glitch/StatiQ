import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../components/ProtectedRoute';
import { fileUrl } from '../lib/api';

// Dedicated logout confirmation page — always centered in the viewport,
// never attached to the navbar. Wellfound-style light card.
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
        className="w-full max-w-[400px] rounded-xl bg-[#ffffff] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.35)]"
        style={{ colorScheme: 'light' }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f3f4f6] text-lg font-bold text-[#111827]">
            {user?.avatarUrl ? (
              <img src={fileUrl(user.avatarUrl)} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-[#111827]">{user?.name || 'Your account'}</p>
            {user?.email && <p className="truncate text-[13px] text-[#6b7280]">{user.email}</p>}
          </div>
        </div>

        <h1 id="logout-title" className="mt-5 text-[18px] font-semibold tracking-tight text-[#111827]">
          Log out of StatiQ?
        </h1>
        <p id="logout-desc" className="mt-1.5 text-[14px] leading-relaxed text-[#6b7280]">
          Are you sure you want to log out? You can always log back in at any time.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={cancel}
            autoFocus
            className="flex-1 rounded-lg border border-[#e5e7eb] bg-[#ffffff] px-4 py-2.5 text-sm font-semibold text-[#111827] hover:bg-[#f9fafb]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            className="flex-1 rounded-lg bg-[#0a0a0a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#282828]"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
