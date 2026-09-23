import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { UserRole } from '../types/index.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Verifying session security...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoleLower = (user.role || '').toLowerCase();
    const isAllowed = allowedRoles.some((r) => r.toLowerCase() === userRoleLower);

    if (!isAllowed) {
      // Redirect according to user role to prevent cross-dashboard access
      if (userRoleLower === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (userRoleLower === 'warden') return <Navigate to="/warden/dashboard" replace />;
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
