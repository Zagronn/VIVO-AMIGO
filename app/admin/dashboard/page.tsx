'use client';

import { useEffect, useState } from 'react';
import { AdminCommandCenterTelemetry } from '@/components/AdminCommandCenterTelemetry';
import { SiteConfigManager } from '@/components/SiteConfigManager';
import { SuperAdminWorkspace } from '@/components/SuperAdminWorkspace';
import { activeSession } from '@/components/adminBrowserAuth';

export default function AdminDashboardPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!activeSession()) window.location.replace('/admin/login');
    else setReady(true);
  }, []);
  return ready ? <><AdminCommandCenterTelemetry /><SiteConfigManager /><SuperAdminWorkspace /></> : null;
}
