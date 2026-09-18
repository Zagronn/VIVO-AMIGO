import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { NewSecondHandForm } from '@/components/NewSecondHandForm';

export const dynamic = 'force-dynamic';

export default async function NewSecondHandPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/second-hand/new');

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black">Post a second-hand listing</h1>
      <p className="mt-2 text-vivo-black/60">
        Sell something you no longer need directly to buyers near you.
      </p>
      <div className="mt-8">
        <NewSecondHandForm />
      </div>
    </div>
  );
}
