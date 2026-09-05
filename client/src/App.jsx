import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/for-companies" element={<ForCompaniesPage />} />
        <Route path="/for-job-seekers" element={<ForSeekersPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/job" element={<JobSeekerLoginPage />} />
        <Route path="/login/hire" element={<EmployerLoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/job" element={<JobSeekerSignupPage />} />
        <Route path="/signup/hire" element={<EmployerSignupPage />} />
        <Route
          path="/post-job"
          element={<ProtectedRoute roles={['employer', 'admin']}><PostJobPage /></ProtectedRoute>}
        />
        <Route
          path="/my-applications"
          element={<ProtectedRoute roles={['jobseeker', 'admin']}><MyApplicationsPage /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
