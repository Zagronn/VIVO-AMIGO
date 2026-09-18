import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { NewRealEstateForm } from '@/components/NewRealEstateForm';

export const dynamic = 'force-dynamic';

export default async function NewRealEstateListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/real-estate/new');

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black">Post a real estate listing</h1>
      <p className="mt-2 text-vivo-black/60">Reach buyers and renters across the region.</p>

      <div className="mt-8">
        <NewRealEstateForm />
      </div>
    </div>
  );
}
