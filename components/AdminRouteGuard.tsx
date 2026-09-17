'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkIsSuperAdmin } from '../services/adminAuth';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const isAuthenticatedAdmin = checkIsSuperAdmin();
    if (!isAuthenticatedAdmin) {
      router.replace('/admin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRouteGuard;
