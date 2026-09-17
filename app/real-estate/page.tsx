import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/money';
import { ClassifiedCard } from '@/components/ClassifiedCard';

export const dynamic = 'force-dynamic';

export default async function RealEstatePage({
  searchParams,
}: {
  searchParams: { city?: string; type?: string; propertyType?: string };
}) {
  const { city, type, propertyType } = searchParams;

  const listings = await db.realEstateListing.findMany({
    where: {
      isActive: true,
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(type ? { listingType: type as any } : {}),
      ...(propertyType ? { propertyType: propertyType as any } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { owner: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-vivo-black">Real Estate</h1>
          <p className="mt-2 text-vivo-black/60">Houses, apartments, land and commercial spaces across the region.</p>
        </div>
        <Link href="/real-estate/new" className="btn-primary">
          Post a listing
        </Link>
      </div>

      <form method="get" className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          name="city"
          defaultValue={city}
          placeholder="City"
          className="input-field w-full sm:w-48"
        />
        <select name="type" defaultValue={type ?? ''} className="input-field w-full sm:w-40">
          <option value="">Any type</option>
          <option value="SALE">For Sale</option>
          <option value="RENT">For Rent</option>
        </select>
        <select name="propertyType" defaultValue={propertyType ?? ''} className="input-field w-full sm:w-48">
          <option value="">Any property</option>
          <option value="HOUSE">House</option>
          <option value="APARTMENT">Apartment</option>
          <option value="LAND">Land</option>
          <option value="COMMERCIAL">Commercial</option>
        </select>
        <button type="submit" className="btn-secondary">
          Filter
        </button>
      </form>

      {listings.length === 0 ? (
        <p className="mt-12 text-center text-vivo-black/50">No listings match your search yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {listings.map((listing) => (
            <ClassifiedCard
              key={listing.id}
              href={`/real-estate/${listing.id}`}
              image={listing.images[0]}
              badge={listing.listingType === 'RENT' ? 'For Rent' : 'For Sale'}
              title={listing.title}
              priceLabel={
                listing.listingType === 'RENT' ? `${formatPrice(listing.price)}/mo` : formatPrice(listing.price)
              }
              meta={[
                listing.propertyType,
                listing.bedrooms ? `${listing.bedrooms} bd` : null,
                listing.bathrooms ? `${listing.bathrooms} ba` : null,
                listing.areaSqm ? `${listing.areaSqm} m²` : null,
                listing.city,
              ].filter((x): x is string => Boolean(x))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
