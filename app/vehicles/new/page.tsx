import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { NewVehicleForm } from '@/components/NewVehicleForm';

export const dynamic = 'force-dynamic';

export default async function NewVehicleListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/vehicles/new');

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black">Post a vehicle listing</h1>
      <p className="mt-2 text-vivo-black/60">Reach buyers across the region with photos and details.</p>

      <div className="mt-8">
        <NewVehicleForm />
      </div>
    </div>
  );
}
