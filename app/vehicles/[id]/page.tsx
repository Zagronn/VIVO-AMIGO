import { notFound } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatPrice } from '@/lib/money';
import { toggleVehicleListingActive } from '@/actions/vehicles';

export const dynamic = 'force-dynamic';

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const [listing, user] = await Promise.all([
    db.vehicleListing.findUnique({
      where: { id: params.id },
      include: { owner: true },
    }),
    getCurrentUser(),
  ]);

  if (!listing) notFound();

  const image = listing.images[0] ?? 'https://picsum.photos/seed/vivo-fallback/800/600';
  const canManage = user && (user.id === listing.ownerId || user.role === 'ADMIN');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-vivo-cream">
          <Image src={image} alt={listing.title} fill sizes="50vw" className="object-cover" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-vivo-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-vivo-orange">
              {listing.condition === 'NEW' ? 'New' : 'Used'}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-vivo-black">
            {listing.year} {listing.make} {listing.model}
          </h1>
          <p className="mt-1 text-vivo-black/60">{listing.title}</p>

          <p className="mt-4 text-2xl font-bold text-vivo-black">{formatPrice(listing.price)}</p>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-vivo-black/40">Make</dt>
              <dd className="font-medium text-vivo-black">{listing.make}</dd>
            </div>
            <div>
              <dt className="text-vivo-black/40">Model</dt>
              <dd className="font-medium text-vivo-black">{listing.model}</dd>
            </div>
            <div>
              <dt className="text-vivo-black/40">Year</dt>
              <dd className="font-medium text-vivo-black">{listing.year}</dd>
            </div>
            <div>
              <dt className="text-vivo-black/40">Mileage</dt>
              <dd className="font-medium text-vivo-black">
                {listing.mileageKm ? `${listing.mileageKm.toLocaleString()} km` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-vivo-black/40">Transmission</dt>
              <dd className="font-medium text-vivo-black">{listing.transmission ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-vivo-black/40">Fuel type</dt>
              <dd className="font-medium text-vivo-black">{listing.fuelType ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-vivo-black/40">City</dt>
              <dd className="font-medium text-vivo-black">{listing.city}</dd>
            </div>
          </dl>

          {listing.description && <p className="mt-6 text-vivo-black/70">{listing.description}</p>}
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-2 text-xl font-bold text-vivo-black">Contact the seller</h2>
          <p className="text-vivo-black/70">{listing.owner.name}</p>
          <a
            href={`mailto:${listing.owner.email}`}
            className="mt-3 inline-block text-vivo-orange hover:underline"
          >
            {listing.owner.email}
          </a>
        </div>

        {canManage && (
          <div className="glass-card p-6">
            <h2 className="mb-2 text-xl font-bold text-vivo-black">Manage listing</h2>
            <p className="mb-4 text-sm text-vivo-black/60">
              This listing is currently {listing.isActive ? 'active' : 'inactive'}.
            </p>
            <form action={toggleVehicleListingActive}>
              <input type="hidden" name="id" value={listing.id} />
              <button type="submit" className="btn-secondary">
                {listing.isActive ? 'Deactivate listing' : 'Reactivate listing'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
