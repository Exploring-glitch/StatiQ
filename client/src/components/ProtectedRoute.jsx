import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) {
    return <p className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-neutral-500">Loading…</p>;
  }
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
