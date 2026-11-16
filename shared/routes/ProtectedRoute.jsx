import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, role, isSuperAdmin, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gurukul-saffron-500"></div>
      </div>
    );
  }

  // Not authenticated: redirect to appropriate login based on intended route
  if (!currentUser) {
    if (location.pathname.startsWith('/super-admin')) {
      return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
    }
    if (location.pathname.startsWith('/telecaller')) {
      return <Navigate to="/telecaller/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0) {
    const normalizedRole = role.toLowerCase();
    const isAllowed = allowedRoles.some(r => {
      const nr = r.toLowerCase();
      if ((nr === 'superadmin' || nr === 'super_admin') && isSuperAdmin) return true;
      if (nr === 'admin' && isAdmin) return true;
      return nr === normalizedRole;
    });

    if (!isAllowed) {
      // Route access denied: redirect to authorized dashboard
      if (normalizedRole === 'telecaller') {
        return <Navigate to="/telecaller/dashboard" replace />;
      }
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
};
