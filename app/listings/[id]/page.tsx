import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  zone?: string;
  images?: string[];
  primaryImageUrl?: string;
}

interface ListingProps {
  params: { id: string };
}

async function getListing(id: string): Promise<Listing | null> {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) throw new Error('API_BASE_URL is required to render listings');

  const res = await fetch(`${baseUrl}/api/v1/listings/${encodeURIComponent(id)}`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) return null;
  return res.json() as Promise<Listing>;
}

function jsonLdSafe(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export async function generateMetadata({ params }: ListingProps): Promise<Metadata> {
  const listing = await getListing(params.id);
  if (!listing) return {};

  const description = listing.description || '';
  return {
    title: `${listing.title} - Q${listing.price} | VIVO AMIGO Guatemala`,
    description: description.slice(0, 160),
    openGraph: {
      title: listing.title,
      description,
      images: listing.primaryImageUrl ? [listing.primaryImageUrl] : [],
      locale: 'es_GT',
      type: 'website'
    }
  };
}

export default async function ListingPage({ params }: ListingProps) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  const description = listing.description || '';
  const images = listing.images?.length ? listing.images : listing.primaryImageUrl ? [listing.primaryImageUrl] : [];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': listing.category === 'VEHICLE' ? 'Vehicle' : 'Product',
    name: listing.title,
    image: images,
    description,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'GTQ',
      availability: 'https://schema.org/InStock',
      areaServed: 'GT'
    },
    locationCreated: {
      '@type': 'Place',
      name: `${listing.zone || 'Guatemala City'}, Guatemala City`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(jsonLd) }}
      />
      <main className="mx-auto max-w-7xl bg-[#111111] px-4 py-8 font-sans text-white">
        <h1 className="text-3xl font-bold text-[#FF6A00]">{listing.title}</h1>
        <div className="my-2 text-2xl font-semibold">
          Q{listing.price.toLocaleString('es-GT')} GTQ
        </div>
        <p className="my-4 leading-relaxed text-[#7A808A]">{description}</p>
      </main>
    </>
  );
}
