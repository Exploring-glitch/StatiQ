import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ScrollToTop } from './AuthLayout';

// Public marketing shell: Navbar + Footer
export default function Layout() {
  return (
    <div className="min-h-screen bg-ink text-neutral-300">
      <ScrollToTop />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
