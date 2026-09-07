import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Role landing page after login. Matches the post-login defaults
// used by the seeker/employer login + signup pages.
export function roleHome(user) {
  if (user?.role === 'employer') return '/post-job';
  return '/jobs'; // jobseeker + admin
}

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-neutral-500">Loading…</p>;
  }
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
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
