import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [], loginPath = null }) => {
  const { currentUser, role, isSuperAdmin, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gurukul-saffron-500"></div>
      </div>
    );
  }

  const isTelecallerRoute = window.location.pathname.startsWith('/telecaller') || 
                            location.pathname.startsWith('/telecaller') ||
                            (typeof window !== 'undefined' && window.location.port === '3002');
  const isBasenameTelecaller = window.location.pathname.startsWith('/telecaller') && !location.pathname.startsWith('/telecaller');
  const isSuperAdminRoute = window.location.pathname.startsWith('/super-admin') || location.pathname.startsWith('/super-admin');

  // Not authenticated: redirect to appropriate login based on intended route
  if (!currentUser) {
    if (loginPath) {
      return <Navigate to={loginPath} state={{ from: location }} replace />;
    }
    if (isSuperAdminRoute) {
      return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
    }
    if (isTelecallerRoute) {
      return <Navigate to={isBasenameTelecaller ? '/login' : '/telecaller/login'} state={{ from: location }} replace />;
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If user is pending admin approval or inactive, deny access to protected portals
  const userStatus = (currentUser?.status || '').toLowerCase();
  const isPending = userStatus === 'pending' || userStatus === 'pending_approval' || currentUser?.role === 'pending_applicant';
  if (isPending || userStatus === 'inactive') {
    if (isTelecallerRoute) {
      return (
        <Navigate 
          to={isBasenameTelecaller ? '/login' : '/telecaller/login'} 
          state={{ 
            from: location,
            errorMessage: 'आपले खाते अद्याप प्रशासकीय मंजुरीसाठी प्रलंबित आहे (Pending Admin Approval). ॲडमिनने मंजूर केल्यानंतरच तुम्हाला प्रवेश मिळेल.'
          }} 
          replace 
        />
      );
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0) {
    const normalizedRole = (role || '').toLowerCase();
    const userEmail = (currentUser?.email || '').trim().toLowerCase();
    const isEmailAdmin = 
      userEmail.includes('adinath') || 
      userEmail.includes('admin') || 
      userEmail.startsWith('principal') || 
      userEmail.startsWith('director') ||
      userEmail === 'contact@gurukulbhose.com';

    const isAllowed = allowedRoles.some(r => {
      const nr = r.toLowerCase();
      if ((nr === 'superadmin' || nr === 'super_admin') && (isSuperAdmin || userEmail.includes('superadmin'))) return true;
      if (nr === 'admin' && (isAdmin || isEmailAdmin)) return true;
      return nr === normalizedRole;
    });

    if (!isAllowed) {
      // Route access denied: redirect to authorized dashboard
      if (normalizedRole === 'telecaller') {
        return <Navigate to={isBasenameTelecaller ? '/dashboard' : '/telecaller/dashboard'} replace />;
      }
      if (isBasenameTelecaller) {
        window.location.replace('/admin/dashboard');
        return null;
      }
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return children;
};
