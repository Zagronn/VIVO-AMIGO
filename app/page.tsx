import Link from 'next/link';
import { db } from '@/lib/db';
import { ProductCard } from '@/components/ProductCard';
import { averageRating } from '@/lib/ratings';

const ecosystem = [
  { name: 'VIVO PAY', description: 'Escrow-backed payments built for cross-border trade.', href: '/pay' },
  { name: 'VIVO SHIP', description: 'Logistics and fleet tracking for last-mile delivery.', href: '/ship' },
  { name: 'VIVO ADS', description: 'Marketplace advertising to reach shoppers where they browse.', href: '/ads' },
  { name: 'VIVO BUSINESS', description: 'Seller tools — inventory, analytics, and payouts.', href: '/business' },
  { name: 'VIVO SUPPORT', description: 'An AI team ready to help buyers and sellers, day or night.', href: '/support' },
];

const classifieds = [
  { name: 'Real Estate', description: 'Houses, apartments, land and commercial spaces.', href: '/real-estate', emoji: '🏠' },
  { name: 'Vehicles', description: 'Cars, trucks and motorcycles — new and used.', href: '/vehicles', emoji: '🚗' },
  { name: 'Jobs', description: 'Full-time, part-time, contract and remote roles.', href: '/jobs', emoji: '💼' },
  { name: 'Second-hand', description: 'Buy and sell used items directly with people near you.', href: '/second-hand', emoji: '📦' },
];

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: { reviews: true, vendor: true },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="glass-card rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-vivo-orange">
            Made for Latin America
          </span>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-vivo-black sm:text-5xl">
            One marketplace. <span className="text-vivo-orange">A whole ecosystem.</span>
          </h1>
          <p className="max-w-xl text-lg text-vivo-black/70">
            VIVO AMIGO connects shoppers and independent sellers across Latin America — with
            payments, shipping, ads, and support all built in.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/products" className="btn-primary">
              Explore the marketplace
            </Link>
            <Link href="/sell" className="btn-secondary">
              Become a seller
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products */}
      {products.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-vivo-black">Featured products</h2>
            <Link href="/products" className="text-sm font-semibold text-vivo-orange hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  images: product.images,
                  avgRating: averageRating(product.reviews),
                  reviewCount: product.reviews.length,
                  storeName: product.vendor.storeName,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Ecosystem */}
      <section id="ecosystem" className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-vivo-black">The VIVO AMIGO ecosystem</h2>
          <p className="mt-2 max-w-2xl text-vivo-black/60">
            Every sub-brand handles one piece of the marketplace, so buying and selling feels
            effortless end to end.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ecosystem.map((brand) => (
              <Link key={brand.name} href={brand.href} className="glass-card p-5 transition hover:border-vivo-orange">
                <p className="font-bold text-vivo-orange">{brand.name}</p>
                <p className="mt-2 text-sm text-vivo-black/60">{brand.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Classifieds */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-vivo-black">Classifieds</h2>
              <p className="mt-2 max-w-2xl text-vivo-black/60">
                Beyond the marketplace — real estate, vehicles, jobs, and second-hand goods,
                posted directly by people near you.
              </p>
            </div>
            <Link href="/classifieds" className="text-sm font-semibold text-vivo-orange hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {classifieds.map((c) => (
              <Link key={c.name} href={c.href} className="glass-card flex items-start gap-3 p-5 transition hover:border-vivo-orange">
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <p className="font-bold text-vivo-black">{c.name}</p>
                  <p className="mt-1 text-sm text-vivo-black/60">{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
