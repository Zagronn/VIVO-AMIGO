import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ProductCard } from '@/components/ProductCard';
import { averageRating } from '@/lib/ratings';

export const dynamic = 'force-dynamic';

export default async function StorePage({ params }: { params: { vendorId: string } }) {
  const vendor = await db.vendorProfile.findUnique({
    where: { id: params.vendorId },
  });

  if (!vendor || vendor.status !== 'ACTIVE') notFound();

  const products = await db.product.findMany({
    where: { vendorId: vendor.id, isActive: true },
    include: { reviews: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="glass-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-vivo-orange">Seller storefront</p>
        <h1 className="mt-1 text-3xl font-extrabold text-vivo-black">{vendor.storeName}</h1>
        <p className="mt-2 text-sm text-vivo-black/60">
          {products.length} {products.length === 1 ? 'product' : 'products'} available
        </p>
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-center text-vivo-black/50">This store hasn't listed any products yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
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
                storeName: vendor.storeName,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
