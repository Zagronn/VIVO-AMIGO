'use client';
import { useEffect, useState } from 'react';
import { SuperAdminWorkspace } from '@/components/SuperAdminWorkspace';
import { activeSession } from '@/components/adminBrowserAuth';
export default function AdminPage() { const [ready, setReady] = useState(false); useEffect(() => { if (!activeSession()) window.location.replace('/admin/login'); else setReady(true); }, []); return ready ? <SuperAdminWorkspace /> : null; }
