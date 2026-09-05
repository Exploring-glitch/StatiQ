import { Outlet } from 'react-router-dom';
import { ScrollToTop } from './AuthLayout';
import AppNavbar from './AppNavbar';

// Logged-in shell: app nav, NO footer
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-base">
      <ScrollToTop />
      <AppNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
