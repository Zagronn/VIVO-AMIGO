import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatPrice } from '@/lib/money';
import { averageRating } from '@/lib/ratings';
import { StarRating } from '@/components/StarRating';
import { AddToCartButton } from '@/components/AddToCartButton';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewList } from '@/components/ReviewList';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, user] = await Promise.all([
    db.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        vendor: true,
        reviews: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    }),
    getCurrentUser(),
  ]);

  if (!product) notFound();

  const alreadyReviewed = user ? product.reviews.some((r) => r.userId === user.id) : false;
  const rating = averageRating(product.reviews);
  const image = product.images[0] ?? 'https://picsum.photos/seed/vivo-fallback/800/600';

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-vivo-cream">
          <Image src={image} alt={product.title} fill sizes="50vw" className="object-cover" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.category && (
              <p className="text-sm font-medium uppercase tracking-wide text-vivo-orange">
                {product.category.name}
              </p>
            )}
            <Link
              href={`/products?vendor=${product.vendor.id}`}
              className="text-sm text-vivo-black/40 hover:text-vivo-orange"
            >
              Sold by {product.vendor.storeName}
            </Link>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-vivo-black">{product.title}</h1>

          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={rating} />
            <span className="text-sm text-vivo-black/60">
              {rating > 0 ? rating.toFixed(1) : 'No ratings yet'} · {product.reviews.length} review
              {product.reviews.length === 1 ? '' : 's'}
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-vivo-black">{formatPrice(product.price)}</p>
          <p className="mt-4 text-vivo-black/70">{product.description}</p>

          <p className="mt-2 text-sm text-vivo-black/50">
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Currently out of stock'}
          </p>

          <div className="mt-6">
            <AddToCartButton productId={product.id} inStock={product.stockQuantity > 0} />
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-bold text-vivo-black">Reviews</h2>
          <ReviewList reviews={product.reviews} />
        </div>

        <div>
          <h2 className="mb-4 text-xl font-bold text-vivo-black">Write a review</h2>
          {alreadyReviewed ? (
            <p className="glass-card p-4 text-sm text-vivo-black/60">
              You already reviewed this product — thanks for the feedback!
            </p>
          ) : (
            <ReviewForm productId={product.id} canReview={!!user} />
          )}
        </div>
      </div>
    </div>
  );
}
