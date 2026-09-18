import Link from 'next/link';

export function SubBrandPage({
  brand,
  tagline,
  description,
  features,
  ctaLabel,
  ctaHref,
}: {
  brand: string;
  tagline: string;
  description: string;
  features: { title: string; description: string }[];
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="glass-card rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-vivo-orange">
            Part of the VIVO AMIGO ecosystem
          </span>
          <h1 className="text-4xl font-extrabold leading-tight text-vivo-black sm:text-5xl">
            VIVO <span className="text-vivo-orange">{brand}</span>
          </h1>
          <p className="max-w-xl text-lg text-vivo-black/70">{tagline}</p>
          <p className="max-w-2xl text-vivo-black/60">{description}</p>
          <Link href={ctaHref} className="btn-primary">
            {ctaLabel}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="glass-card p-6">
              <h2 className="font-bold text-vivo-black">{f.title}</h2>
              <p className="mt-2 text-sm text-vivo-black/60">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
