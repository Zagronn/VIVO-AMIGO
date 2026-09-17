import { notFound } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatPrice } from '@/lib/money';
import { toggleRealEstateListingActive } from '@/actions/realEstate';

export const dynamic = 'force-dynamic';

export default async function RealEstateDetailPage({ params }: { params: { id: string } }) {
  const [listing, user] = await Promise.all([
    db.realEstateListing.findUnique({
      where: { id: params.id },
      include: { owner: true },
    }),
    getCurrentUser(),
  ]);

  if (!listing) notFound();

  const image = listing.images[0] ?? 'https://picsum.photos/seed/vivo-fallback/800/600';
  const priceLabel =
    listing.listingType === 'RENT' ? `${formatPrice(listing.price)}/mo` : formatPrice(listing.price);
  const canManage = user && (user.id === listing.ownerId || user.role === 'ADMIN');

  const facts = [
    listing.bedrooms ? `${listing.bedrooms} bedrooms` : null,
    listing.bathrooms ? `${listing.bathrooms} bathrooms` : null,
    listing.areaSqm ? `${listing.areaSqm} m²` : null,
    `${listing.city}, ${listing.country}`,
  ].filter((x): x is string => Boolean(x));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-vivo-cream">
          <Image src={image} alt={listing.title} fill sizes="50vw" className="object-cover" />
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-vivo-orange">
            {listing.listingType === 'RENT' ? 'For Rent' : 'For Sale'} · {listing.propertyType}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-vivo-black">{listing.title}</h1>

          <p className="mt-4 text-2xl font-bold text-vivo-black">{priceLabel}</p>

          {facts.length > 0 && (
            <p className="mt-2 text-sm text-vivo-black/50">{facts.join(' · ')}</p>
          )}

          {listing.description && <p className="mt-4 text-vivo-black/70">{listing.description}</p>}

          <div className="mt-8 glass-card p-4">
            <h2 className="mb-2 text-sm font-bold text-vivo-black">Contact the owner</h2>
            <a href={`mailto:${listing.owner.email}`} className="text-vivo-orange hover:underline">
              Email {listing.owner.name}
            </a>
          </div>

          {canManage && (
            <form action={toggleRealEstateListingActive} className="mt-6">
              <input type="hidden" name="id" value={listing.id} />
              <button
                type="submit"
                className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
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
