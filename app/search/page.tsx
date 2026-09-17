import { db } from '@/lib/db';
import { ProductCard } from '@/components/ProductCard';
import { averageRating } from '@/lib/ratings';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = (searchParams.q ?? '').trim();

  const products = query
    ? await db.product.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { reviews: true, vendor: true },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black">Search the marketplace</h1>

      <form action="/search" className="mt-6 flex max-w-lg gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search products…"
          className="input-field"
        />
        <button type="submit" className="btn-primary !px-5">
          Search
        </button>
      </form>

      {!query ? (
        <p className="mt-12 text-center text-vivo-black/50">Type something above to search the marketplace.</p>
      ) : products.length === 0 ? (
        <p className="mt-12 text-center text-vivo-black/50">No products match "{query}".</p>
      ) : (
        <>
          <p className="mt-8 text-sm text-vivo-black/50">
            {products.length} {products.length === 1 ? 'result' : 'results'} for "{query}"
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
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
        </>
      )}
    </div>
  );
}
