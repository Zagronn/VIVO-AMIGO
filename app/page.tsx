import Link from 'next/link';
import { db } from '@/lib/db';
import { ProductCard } from '@/components/ProductCard';
import { averageRating } from '@/lib/ratings';
import { ShareButtons } from '@/components/ShareButtons';
import { RewardBadge } from '@/components/RewardBadge';
import { getCurrentUser } from '@/lib/session';

const ecosystem = [
  { name: 'VIVO SHIP', description: 'Logistics and fleet tracking for last-mile delivery.', href: '/ship', icon: '🚚' },
  { name: 'VIVO ADS', description: 'Marketplace advertising to reach shoppers where they browse.', href: '/ads', icon: '📈' },
  { name: 'VIVO BUSINESS', description: 'Seller tools — inventory, analytics, and payouts.', href: '/business', icon: '💼' },
  { name: 'VIVO SUPPORT', description: 'An AI team ready to help buyers and sellers, day or night.', href: '/support', icon: '🎧' },
];

const categories = [
  { name: 'Electrónica', href: '/products?category=electronica', icon: '📱' },
  { name: 'Moda', href: '/products?category=moda', icon: '👕' },
  { name: 'Hogar', href: '/products?category=hogar', icon: '🏠' },
  { name: 'Vehículos', href: '/vehicles', icon: '🚗' },
  { name: 'Agricultura', href: '/products?category=agricultura', icon: '🚜' },
  { name: 'Industria', href: '/products?category=industria', icon: '⚙️' },
  { name: 'Servicios', href: '/products?category=servicios', icon: '🛠️' },
];

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [products, user] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { reviews: true, vendor: true },
    }),
    getCurrentUser(),
  ]);

  let discount = 0;
  if (user && db.userShare) {
    const shares = await db.userShare.count({
      where: { userId: user.id },
    });
    discount = shares * 1;
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-vivo-cream py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:gap-12">
            <div className="flex-1 z-10">
              <h1 className="text-5xl font-extrabold leading-tight text-vivo-black sm:text-6xl lg:text-7xl">
                Todo lo que buscas, <br className="hidden sm:block" />
                <span className="text-vivo-orange">en un solo lugar</span>
              </h1>
              <p className="mt-6 text-lg text-vivo-black/70 sm:text-xl max-w-2xl mx-auto lg:mx-0">
                Compra, vende y conecta en todo Latinoamérica. El ecosistema digital más completo para el comercio independiente.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Link href="/products" className="btn-primary px-8 py-4 text-lg">
                  Conocer más
                </Link>
                <Link href="/sell" className="btn-secondary px-8 py-4 text-lg">
                  Vender ahora
                </Link>
              </div>
            </div>

            {/* Visuals: Floating Product Mockups */}
            <div className="relative mt-16 flex-1 lg:mt-0 hidden sm:flex justify-center items-center">
              <div className="relative w-full max-w-md aspect-square">
                {/* Main central image placeholder */}
                <div className="absolute inset-0 bg-vivo-orange/10 rounded-full blur-3xl" />
                <img
                  src="https://placehold.co/600x600/FF6A1A/FFFFFF?text=VIVO+AMIGO+Market"
                  alt="Marketplace"
                  className="relative z-10 w-full h-full object-cover rounded-3xl shadow-2xl rotate-3"
                />

                {/* Floating accent elements */}
                <div className="absolute -top-8 -left-8 z-20 w-32 h-32 bg-white p-2 rounded-2xl shadow-xl rotate-[-12deg] border border-vivo-black/5">
                  <img src="https://placehold.co/100x100?text=Phone" className="w-full h-full object-cover rounded-lg" alt="Product" />
                </div>
                <div className="absolute -bottom-8 -right-8 z-20 w-32 h-32 bg-white p-2 rounded-2xl shadow-xl rotate-[12deg] border border-vivo-black/5">
                  <img src="https://placehold.co/100x100?text=Shoes" className="w-full h-full object-cover rounded-lg" alt="Product" />
                </div>
                <div className="absolute top-1/2 -right-12 z-20 w-24 h-24 bg-white p-2 rounded-2xl shadow-xl rotate-[-45deg] border border-vivo-black/5">
                  <img src="https://placehold.co/100x100?text=Coffee" className="w-full h-full object-cover rounded-lg" alt="Product" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-3xl font-bold text-vivo-black">Explora por categorías</h2>
            <div className="mt-2 h-1 w-20 bg-vivo-orange mx-auto sm:mx-0" />
          </div>

          <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 lg:grid-cols-7">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group flex flex-col items-center gap-3 text-center transition-all"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-vivo-cream text-3xl transition-all group-hover:bg-vivo-orange group-hover:text-white shadow-sm border border-vivo-black/5">
                  {cat.icon}
                </div>
                <span className="text-sm font-semibold text-vivo-black/80 group-hover:text-vivo-orange">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Cards Section */}
      <section className="py-16 bg-vivo-cream/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* VIVO PAY Card */}
            <div className="relative overflow-hidden rounded-3xl bg-vivo-black p-8 text-white shadow-xl group transition-transform hover:-translate-y-1">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-vivo-orange text-white font-bold text-xl">
                    $
                  </div>
                  <h3 className="text-3xl font-bold">VIVO PAY</h3>
                  <p className="mt-4 text-lg text-white/70 max-w-md">
                    Paga, recibe y transfiere dinero de forma rápida y segura.
                    Escrow-backed payments built for cross-border trade.
                  </p>
                </div>
                <Link href="/pay" className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-vivo-black transition hover:bg-vivo-orange hover:text-white">
                  Saber más
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-vivo-orange/20 blur-3xl group-hover:bg-vivo-orange/30 transition-all" />
            </div>

            {/* VIVO SHIP Card */}
            <div className="relative overflow-hidden rounded-3xl bg-vivo-orange p-8 text-white shadow-xl group transition-transform hover:-translate-y-1">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-vivo-orange font-bold text-xl">
                    📦
                  </div>
                  <h3 className="text-3xl font-bold">VIVO SHIP</h3>
                  <p className="mt-4 text-lg text-white/90 max-w-md">
                    Enviamos a toda Latinoamérica. Rápido, seguro y confiable.
                    Logistics and fleet tracking for last-mile delivery.
                  </p>
                </div>
                <Link href="/ship" className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-vivo-black px-6 py-3 text-sm font-bold text-white transition hover:bg-vivo-black/80">
                  Saber más
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-white/20 blur-3xl group-hover:bg-white/30 transition-all" />
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ecosystem.map((brand) => (
              <Link
                key={brand.name}
                href={brand.href}
                className="group relative overflow-hidden rounded-2xl border border-vivo-black/10 p-6 transition-all hover:border-vivo-orange hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-vivo-cream text-2xl transition-colors group-hover:bg-vivo-orange group-hover:text-white">
                  {brand.icon}
                </div>
                <h3 className="text-xl font-bold text-vivo-black">{brand.name}</h3>
                <p className="mt-2 text-sm text-vivo-black/60 leading-relaxed">
                  {brand.description}
                </p>
                <div className="mt-6 flex items-center gap-1 text-xs font-bold text-vivo-orange opacity-0 transition-all group-hover:opacity-100">
                  EXPLORAR <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product Vitrina Section */}
      <section className="py-16 bg-vivo-cream/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-vivo-black">Vitrina de Productos</h2>
              <p className="mt-2 text-vivo-black/60">Descubre lo mejor de nuestras marcas aliadas</p>
            </div>
            <Link href="/products" className="hidden text-sm font-bold text-vivo-orange hover:underline sm:block">
              Ver todo el catálogo →
            </Link>
          </div>

          {products.length > 0 ? (
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
          ) : (
            <div className="text-center py-20 text-vivo-black/40">
              No hay productos destacados en este momento.
            </div>
          )}
        </div>
      </section>

      {/* General Share Section */}
      <section className="py-12 border-t border-vivo-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-lg font-bold text-vivo-black">Love VIVO AMIGO?</h3>
            <RewardBadge discount={discount} />
          </div>
          <p className="text-sm text-vivo-black/60">Share the ecosystem with your friends and family across Latin America</p>
          <ShareButtons title="VIVO AMIGO — The Latin American Marketplace Ecosystem" />
        </div>
      </section>
    </div>
  );
}
