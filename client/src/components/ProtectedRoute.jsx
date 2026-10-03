import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../lib/roleHome';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-neutral-500">Loading…</p>;
  }
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={roleHome(user)} replace />;
  return children;
}

// Inverse of ProtectedRoute: only for guests (landing page, login, signup).
// Logged-in users are sent to their role home instead.
export function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-neutral-500">Loading…</p>;
  }
  if (user) return <Navigate to={roleHome(user)} replace />;
  return children;
}
