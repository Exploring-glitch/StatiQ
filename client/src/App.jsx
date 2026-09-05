import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
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
import DashboardPage from './pages/DashboardPage';
import ApplicantsPage from './pages/ApplicantsPage';
import NotFoundPage from './pages/NotFoundPage';

const seeker = ['jobseeker', 'admin'];
const employer = ['employer', 'admin'];

function App() {
  return (
    <Routes>
      {/* Landing + public browsing (footer) */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/for-companies" element={<ForCompaniesPage />} />
        <Route path="/for-job-seekers" element={<ForSeekersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth — no footer */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/job" element={<JobSeekerLoginPage />} />
        <Route path="/login/hire" element={<EmployerLoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/job" element={<JobSeekerSignupPage />} />
        <Route path="/signup/hire" element={<EmployerSignupPage />} />
      </Route>

      {/* Signed-in app — no footer */}
      <Route element={<AppLayout />}>
        <Route path="/post-job" element={<ProtectedRoute roles={employer}><PostJobPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute roles={employer}><DashboardPage /></ProtectedRoute>} />
        <Route path="/jobs/:id/applicants" element={<ProtectedRoute roles={employer}><ApplicantsPage /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute roles={seeker}><MyApplicationsPage /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute roles={seeker}><SavedJobsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute roles={[...seeker, ...employer]}><ProfilePage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
