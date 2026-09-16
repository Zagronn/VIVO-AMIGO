'use client';

import { useEffect, useState } from 'react';
import { AdminCommandCenterTelemetry } from '@/components/AdminCommandCenterTelemetry';
import { SiteConfigManager } from '@/components/SiteConfigManager';
import { SuperAdminWorkspace } from '@/components/SuperAdminWorkspace';
import SecurityAlertsWidget from '@/components/admin/SecurityAlertsWidget';
import { activeSession } from '@/components/adminBrowserAuth';

export default function AdminDashboardPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!activeSession()) window.location.replace('/admin/login');
    else setReady(true);
  }, []);
  return ready ? (
    <>
      <AdminCommandCenterTelemetry />
      <div className="vivo-public-shell px-4 pt-3 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SecurityAlertsWidget />
        </div>
      </div>
      <SiteConfigManager />
      <SuperAdminWorkspace />
    </>
  ) : null;
}
