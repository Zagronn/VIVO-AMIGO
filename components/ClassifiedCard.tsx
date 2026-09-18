import Image from 'next/image';
import Link from 'next/link';

/**
 * Shared card for the classifieds verticals (real estate, vehicles, jobs,
 * second-hand) — distinct from ProductCard since these aren't "add to
 * cart" items, just a photo, a price/meta line, and a couple of details.
 */
export function ClassifiedCard({
  href,
  image,
  badge,
  title,
  priceLabel,
  meta,
}: {
  href: string;
  image?: string | null;
  badge?: string;
  title: string;
  priceLabel: string;
  meta: string[];
}) {
  return (
    <Link href={href} className="glass-card group flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-vivo-cream">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-vivo-black/30">
            No photo
          </div>
        )}
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-vivo-black/70 backdrop-blur">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-1 font-semibold text-vivo-black">{title}</h3>
        <p className="font-bold text-vivo-orange">{priceLabel}</p>
        {meta.length > 0 && (
          <p className="mt-1 line-clamp-1 text-xs text-vivo-black/50">{meta.join(' · ')}</p>
        )}
      </div>
    </Link>
  );
}
