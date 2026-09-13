'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkIsSuperAdmin } from '../services/adminAuth';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticatedAdmin = checkIsSuperAdmin();
    if (!isAuthenticatedAdmin) {
      router.replace('/login');
    }
  }, [router]);

  return <>{children}</>;
};

export default AdminRouteGuard;
