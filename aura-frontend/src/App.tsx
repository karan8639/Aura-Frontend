import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, normalizeRole, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import EmployerDashboard from './pages/employer/Dashboard';
import LandingPage from './pages/LandingPage';
import JobsFeed from './pages/seeker/JobsFeed';
import MyApplications from './pages/seeker/MyApplications';

// --- Placeholder Components ---
const JobDetails = () => <div className="p-8 text-center text-xl">Job Details Page (Job Seeker)</div>;
const SetupCompany = () => <div className="p-8 text-center text-xl">Setup Company Page (Employer)</div>;

const ProtectedLayout = ({ children }: { children: ReactNode }) => <Layout>{children}</Layout>;

// --- Role-based Home Redirect ---
const HomeRedirect = () => {
  const { user, isLoading, token } = useAuth();

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user?.role);

  if (role === 'EMPLOYER') {
    return <Navigate to="/employer/dashboard" replace />;
  }

  if (role === 'JOB_SEEKER' || role === 'SEEKER') {
    return <Navigate to="/jobs" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Sonner Toaster for global notifications */}
        <Toaster position="top-right" richColors />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Any Role) */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <HomeRedirect />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes (Job Seeker) */}
          <Route 
            path="/jobs" 
            element={
              <ProtectedRoute allowedRole="JOB_SEEKER">
                <ProtectedLayout>
                  <JobsFeed />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs/:id" 
            element={
              <ProtectedRoute allowedRole="JOB_SEEKER">
                <ProtectedLayout>
                  <JobDetails />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/seeker/applications" 
            element={
              <ProtectedRoute allowedRole="JOB_SEEKER">
                <ProtectedLayout>
                  <MyApplications />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes (Employer) */}
          <Route 
            path="/employer/dashboard" 
            element={
              <ProtectedRoute allowedRole="EMPLOYER">
                <ProtectedLayout>
                  <EmployerDashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/setup-company" 
            element={
              <ProtectedRoute allowedRole="EMPLOYER">
                <ProtectedLayout>
                  <SetupCompany />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
