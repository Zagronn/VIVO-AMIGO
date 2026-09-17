import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { NewJobForm } from '@/components/NewJobForm';

export const dynamic = 'force-dynamic';

export default async function NewJobPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/jobs/new');

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black">Post a job</h1>
      <p className="mt-2 text-vivo-black/60">Share an opening with the VIVO AMIGO community.</p>

      <div className="mt-8">
        <NewJobForm />
      </div>
    </div>
  );
}
