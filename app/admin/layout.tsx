import { redirect } from 'next/navigation';
import { getAdminSession } from '@/services/adminAuth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return children;
}
