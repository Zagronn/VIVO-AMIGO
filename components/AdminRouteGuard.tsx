import React from 'react';
import { Navigate } from 'react-router-dom';
import { checkIsSuperAdmin } from '../services/adminAuth';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const isAuthenticatedAdmin = checkIsSuperAdmin();
  if (!isAuthenticatedAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default AdminRouteGuard;
