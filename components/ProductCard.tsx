import Image from 'next/image';
import Link from 'next/link';
import { StarRating } from '@/components/StarRating';
import { formatPrice } from '@/lib/money';
import type { Prisma } from '@prisma/client';

export function ProductCard({
  product,
}: {
  product: {
    id: string;
    title: string;
    price: Prisma.Decimal | number | string;
    images: string[];
    avgRating: number;
    reviewCount: number;
    storeName?: string;
  };
}) {
  const image = product.images[0] ?? 'https://picsum.photos/seed/vivo-fallback/800/600';

  return (
    <Link href={`/products/${product.id}`} className="glass-card group flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-vivo-cream">
        <Image
          src={image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.storeName && (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-vivo-black/40">
            {product.storeName}
          </p>
        )}
        <h3 className="font-semibold text-vivo-black">{product.title}</h3>
        <div className="flex items-center gap-2 text-xs text-vivo-black/60">
          <StarRating rating={product.avgRating} size="sm" />
          <span>({product.reviewCount})</span>
        </div>
        <p className="mt-2 font-bold text-vivo-orange">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
