import { notFound } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatPrice } from '@/lib/money';
import { toggleSecondHandListingActive } from '@/actions/secondhand';

export const dynamic = 'force-dynamic';

const CONDITION_LABELS: Record<string, string> = {
  LIKE_NEW: 'Like new',
  GOOD: 'Good',
  FAIR: 'Fair',
};

export default async function SecondHandDetailPage({ params }: { params: { id: string } }) {
  const [listing, user] = await Promise.all([
    db.secondHandListing.findUnique({
      where: { id: params.id },
      include: { seller: true },
    }),
    getCurrentUser(),
  ]);

  if (!listing) notFound();

  const image = listing.images[0] ?? 'https://picsum.photos/seed/vivo-fallback/800/600';
  const canManage = !!user && (user.id === listing.sellerId || user.role === 'ADMIN');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-vivo-cream">
          <Image src={image} alt={listing.title} fill sizes="50vw" className="object-cover" />
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-vivo-orange">
            {CONDITION_LABELS[listing.condition]}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-vivo-black">{listing.title}</h1>

          <p className="mt-4 text-2xl font-bold text-vivo-black">{formatPrice(listing.price)}</p>

          <p className="mt-2 text-sm text-vivo-black/50">
            {listing.category} · {listing.city}
          </p>

          {listing.description && <p className="mt-4 text-vivo-black/70">{listing.description}</p>}

          <div className="glass-card mt-8 p-4">
            <h2 className="mb-2 text-sm font-bold text-vivo-black">Contact the seller</h2>
            <a
              href={`mailto:${listing.seller.email}`}
              className="text-sm font-medium text-vivo-orange hover:underline"
            >
              Email {listing.seller.name}
            </a>
          </div>

          {canManage && (
            <form action={toggleSecondHandListingActive} className="mt-4">
              <input type="hidden" name="id" value={listing.id} />
              <button
                type="submit"
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  listing.isActive
                    ? 'border border-vivo-black/10 bg-white text-vivo-black/60 hover:border-red-300 hover:text-red-600'
                    : 'bg-vivo-orange text-white hover:bg-vivo-orange-dark'
                }`}
              >
                {listing.isActive ? 'Deactivate listing' : 'Reactivate listing'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
