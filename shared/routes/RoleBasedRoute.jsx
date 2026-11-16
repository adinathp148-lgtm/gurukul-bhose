import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';

export const RoleBasedRoute = ({ children, allowedRoles }) => {
  return <ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>;
};

export const SuperAdminRoute = ({ children }) => {
  return <ProtectedRoute allowedRoles={['super_admin', 'superadmin']}>{children}</ProtectedRoute>;
};

export const AdminRoute = ({ children }) => {
  return <ProtectedRoute allowedRoles={['super_admin', 'superadmin', 'admin']}>{children}</ProtectedRoute>;
};

export const TelecallerRoute = ({ children }) => {
  return <ProtectedRoute allowedRoles={['telecaller', 'super_admin', 'admin']}>{children}</ProtectedRoute>;
};
