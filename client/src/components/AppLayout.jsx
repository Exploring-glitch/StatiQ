import { Outlet } from 'react-router-dom';
import { ScrollToTop } from './AuthLayout';
import { useAuth } from '../context/AuthContext';
import SeekerNavbar from './SeekerNavbar';
import EmployerNavbar from './EmployerNavbar';

// Logged-in shell — role-split UI, NO footer.

export default function AppLayout() {
  const { user, loading } = useAuth();
  const isEmployer = user?.role === 'employer';

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-neutral-300">
        <p className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  if (isEmployer) {
    return (
      <div className="min-h-screen bg-ink text-neutral-300">
        <ScrollToTop />
        <EmployerNavbar />
        <div className="lg:pl-64">
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-neutral-300">
      <ScrollToTop />
      <SeekerNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
