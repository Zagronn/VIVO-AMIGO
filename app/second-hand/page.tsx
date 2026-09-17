import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/money';
import { ClassifiedCard } from '@/components/ClassifiedCard';

export const dynamic = 'force-dynamic';

const CONDITION_LABELS: Record<string, string> = {
  LIKE_NEW: 'Like new',
  GOOD: 'Good',
  FAIR: 'Fair',
};

export default async function SecondHandPage({
  searchParams,
}: {
  searchParams: { category?: string; city?: string };
}) {
  const { category, city } = searchParams;

  const listings = await db.secondHandListing.findMany({
    where: {
      isActive: true,
      ...(category ? { category: { contains: category, mode: 'insensitive' } } : {}),
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-vivo-black">Second-hand</h1>
          <p className="mt-2 text-vivo-black/60">
            Buy and sell used items directly with people near you.
          </p>
        </div>
        <Link href="/second-hand/new" className="btn-primary">
          Post a listing
        </Link>
      </div>

      <form method="get" className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          name="category"
          defaultValue={category ?? ''}
          placeholder="Category"
          className="input-field w-40"
        />
        <input
          type="text"
          name="city"
          defaultValue={city ?? ''}
          placeholder="City"
          className="input-field w-40"
        />
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
              href={`/second-hand/${listing.id}`}
              image={listing.images[0]}
              badge={CONDITION_LABELS[listing.condition]}
              title={listing.title}
              priceLabel={formatPrice(listing.price)}
              meta={[listing.category, listing.city]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
