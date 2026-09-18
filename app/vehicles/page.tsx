import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/money';
import { ClassifiedCard } from '@/components/ClassifiedCard';

export const dynamic = 'force-dynamic';

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: { make?: string; city?: string; condition?: string };
}) {
  const { make, city, condition } = searchParams;

  const listings = await db.vehicleListing.findMany({
    where: {
      isActive: true,
      ...(make ? { make: { contains: make, mode: 'insensitive' } } : {}),
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(condition ? { condition: condition as any } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { owner: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-vivo-black">Vehicles</h1>
          <p className="mt-2 text-vivo-black/60">Cars, trucks, and motorcycles from sellers across the region.</p>
        </div>
        <Link href="/vehicles/new" className="btn-primary">
          Post a listing
        </Link>
      </div>

      <form method="get" className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          name="make"
          defaultValue={make}
          placeholder="Make"
          className="input-field w-40"
        />
        <input
          type="text"
          name="city"
          defaultValue={city}
          placeholder="City"
          className="input-field w-40"
        />
        <select name="condition" defaultValue={condition ?? ''} className="input-field w-40">
          <option value="">Any condition</option>
          <option value="NEW">New</option>
          <option value="USED">Used</option>
        </select>
        <button type="submit" className="btn-secondary">
          Filter
        </button>
      </form>

      {listings.length === 0 ? (
        <p className="mt-12 text-center text-vivo-black/50">No vehicle listings match your search yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {listings.map((listing) => (
            <ClassifiedCard
              key={listing.id}
              href={`/vehicles/${listing.id}`}
              image={listing.images[0]}
              badge={listing.condition === 'NEW' ? 'New' : 'Used'}
              title={listing.title}
              priceLabel={formatPrice(listing.price)}
              meta={[
                String(listing.year),
                listing.mileageKm ? `${listing.mileageKm.toLocaleString()} km` : null,
                listing.transmission,
                listing.city,
              ].filter((x): x is string => Boolean(x))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
