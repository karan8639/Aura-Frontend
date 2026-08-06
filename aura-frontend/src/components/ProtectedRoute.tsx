import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { normalizeRole, useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'EMPLOYER' | 'JOB_SEEKER' | 'SEEKER';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have a token but the profile is still resolving, show a loading fallback instead of a blank screen.
  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Loading your workspace...</div>;
  }

  const normalizedUserRole = normalizeRole(user?.role);
  const normalizedAllowedRole = allowedRole ? normalizeRole(allowedRole) : undefined;

  if (normalizedAllowedRole && normalizedUserRole !== normalizedAllowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
