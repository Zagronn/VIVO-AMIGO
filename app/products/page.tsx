import { db } from '@/lib/db';
import { ProductCard } from '@/components/ProductCard';
import { averageRating } from '@/lib/ratings';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categories = await db.category.findMany({ orderBy: { name: 'asc' } });
  const activeSlug = searchParams.category;

  const products = await db.product.findMany({
    where: {
      isActive: true,
      ...(activeSlug ? { category: { slug: activeSlug } } : {}),
    },
    include: { reviews: true, vendor: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black">Marketplace</h1>
      <p className="mt-2 text-vivo-black/60">Discover products from independent sellers across the region.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href="/products"
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            !activeSlug
              ? 'bg-vivo-orange text-white'
              : 'glass-card text-vivo-black/70 hover:border-vivo-orange'
          }`}
        >
          All
        </a>
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/products?category=${c.slug}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              activeSlug === c.slug
                ? 'bg-vivo-orange text-white'
                : 'glass-card text-vivo-black/70 hover:border-vivo-orange'
            }`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-center text-vivo-black/50">No products in this category yet.</p>
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
                storeName: product.vendor.storeName,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
