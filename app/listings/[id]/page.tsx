import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BankCreditCalculator } from '../../../components/BankCreditCalculator';
import { InspectionBadge } from '../../../components/InspectionBadge';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  zone?: string;
  images?: string[];
  primaryImageUrl?: string;
  sellerName?: string;
  isCorporate?: boolean;
  inspectionScore?: number;
  inspectionPdfUrl?: string;
  qrCodeUrl?: string;
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
  const inspectionScore = listing.inspectionScore ?? 0;
  const inspectionPdfUrl = listing.inspectionPdfUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vivoamigo.com'}/reports/${listing.id}.pdf`;
  const qrCodeUrl = listing.qrCodeUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vivoamigo.com'}/verify/${listing.id}`;
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
      <main className="mx-auto min-h-screen max-w-4xl bg-[#111111] px-4 pb-28 py-8 font-sans text-white">
        <div className="mb-4 border-b border-gray-800 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00]">{listing.category || 'MARKETPLACE'}</span>
          <h1 className="mt-1 text-3xl font-bold text-[#FF6A00]">{listing.title}</h1>
        </div>
        <div className="my-2 text-2xl font-semibold tabular-nums">
          Q{listing.price.toLocaleString('es-GT')} GTQ
        </div>
        <div className="mb-4 rounded-2xl border border-gray-800 bg-[#191919] p-4">
          <h2 className="mb-2 text-sm font-bold text-gray-400">Descripción</h2>
          <p className="leading-relaxed text-[#7A808A]">{description}</p>
          {listing.sellerName && <p className="mt-3 text-xs text-gray-400">Vendedor: <strong className="text-white">{listing.sellerName}</strong>{listing.isCorporate ? ' · Empresa verificada' : ''}</p>}
        </div>
        {listing.inspectionScore !== undefined && <InspectionBadge inspectionId={`INSP-${listing.id}`} score={inspectionScore} qrCodeUrl={qrCodeUrl} pdfReportUrl={inspectionPdfUrl} />}
        {(listing.category === 'REAL_ESTATE' || listing.category === 'VEHICLE') && <BankCreditCalculator propertyPriceGTQ={listing.price} />}
        <div className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-4xl gap-3 border-t border-gray-800 bg-[#111111]/90 p-4 backdrop-blur-md">
          <button type="button" className="flex-1 rounded-xl bg-[#FF6A00] py-3.5 text-center text-sm font-extrabold text-black shadow-lg transition-all hover:bg-[#e05d00]">Comprar con Escrow Seguro</button>
        </div>
      </main>
    </>
  );
}
