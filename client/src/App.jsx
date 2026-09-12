import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import AppLayout from './components/AppLayout';
import ProtectedRoute, { GuestOnly } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import ForCompaniesPage from './pages/ForCompaniesPage';
import ForSeekersPage from './pages/ForSeekersPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import JobSeekerLoginPage from './pages/JobSeekerLoginPage';
import EmployerLoginPage from './pages/EmployerLoginPage';
import JobSeekerSignupPage from './pages/JobSeekerSignupPage';
import EmployerSignupPage from './pages/EmployerSignupPage';
import PostJobPage from './pages/PostJobPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import SavedJobsPage from './pages/SavedJobsPage';
import ProfilePage from './pages/ProfilePage';
import LogoutPage from './pages/LogoutPage';
import DashboardPage from './pages/DashboardPage';
import ApplicantsPage from './pages/ApplicantsPage';
import NotFoundPage from './pages/NotFoundPage';

const seeker = ['jobseeker', 'admin'];
const employer = ['employer', 'admin'];

// Guests: landing (/) + auth pages + 404 only. Everything else → login.
// Logged-in users visiting / or auth pages → role home (/jobs or /post-job).
function App() {
  return (
    <Routes>
      {/* Public: landing only (+ 404). Logged-in users bounce to role home. */}
      <Route element={<Layout />}>
        <Route path="/" element={<GuestOnly><HomePage /></GuestOnly>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth — guests only; logged-in users bounce to role home */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/login/job" element={<GuestOnly><JobSeekerLoginPage /></GuestOnly>} />
        <Route path="/login/hire" element={<GuestOnly><EmployerLoginPage /></GuestOnly>} />
        <Route path="/signup" element={<GuestOnly><SignupPage /></GuestOnly>} />
        <Route path="/signup/job" element={<GuestOnly><JobSeekerSignupPage /></GuestOnly>} />
        <Route path="/signup/hire" element={<GuestOnly><EmployerSignupPage /></GuestOnly>} />
      </Route>

      {/* Signed-in app — no footer. Browsing pages need login; role pages need a role. */}
      <Route element={<AppLayout />}>
        <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<ProtectedRoute><JobDetailPage /></ProtectedRoute>} />
        <Route path="/for-companies" element={<ProtectedRoute><ForCompaniesPage /></ProtectedRoute>} />
        <Route path="/for-job-seekers" element={<ProtectedRoute><ForSeekersPage /></ProtectedRoute>} />
        <Route path="/post-job" element={<ProtectedRoute roles={employer}><PostJobPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute roles={employer}><DashboardPage /></ProtectedRoute>} />
        <Route path="/jobs/:id/applicants" element={<ProtectedRoute roles={employer}><ApplicantsPage /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute roles={seeker}><MyApplicationsPage /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute roles={seeker}><SavedJobsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute roles={[...seeker, ...employer]}><ProfilePage /></ProtectedRoute>} />
        <Route path="/logout" element={<ProtectedRoute roles={[...seeker, ...employer]}><LogoutPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
