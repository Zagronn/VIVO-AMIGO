import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BankCreditCalculator } from '../../../components/BankCreditCalculator';
import { InspectionBadge } from '../../../components/InspectionBadge';
import { CorporateBillboard } from '../../../components/CorporateBillboard';
import { AdServerEngine } from '../../../services/adServerEngine';
import { TrustBar } from '../../../components/TrustBar';
import { InsuranceShieldBadge } from '../../../components/InsuranceShieldBadge';
import { OneClickCheckoutBar } from '../../../components/OneClickCheckoutBar';
import { VivoFlywheelEngine } from '../../../services/vivoFlywheelEngine';

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

const fallbackListings: Record<string, Listing> = {
  'macbook-pro-m3': { id: 'macbook-pro-m3', title: 'MacBook Pro M3', description: 'MacBook Pro verificado para trabajo creativo y profesional.', price: 14500, category: 'ELECTRONICS', zone: 'Guatemala City', sellerName: 'VIVO Marketplace' },
  'toyota-hilux-2022': { id: 'toyota-hilux-2022', title: 'Toyota Hilux 2022', description: 'Toyota Hilux 2022 con historial de inspección disponible.', price: 215000, category: 'VEHICLE', zone: 'Mixco', sellerName: 'VIVO Marketplace' },
  'cafe-altura-500g': { id: 'cafe-altura-500g', title: 'Café de altura 500g', description: 'Café de altura tostado en Guatemala.', price: 18, category: 'AGRICULTURE', zone: 'Huehuetenango', sellerName: 'VIVO Marketplace' },
  'casa-zona-14': { id: 'casa-zona-14', title: 'Casa en Zona 14', description: 'Casa familiar en Zona 14, Guatemala City.', price: 2500000, category: 'REAL_ESTATE', zone: 'Zona 14', sellerName: 'VIVO Marketplace' }
};

export const dynamicParams = true;
export const revalidate = 60;

async function getListing(id: string): Promise<Listing | null> {
  if (fallbackListings[id]) return fallbackListings[id];
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) return fallbackListings[id] || null;

  try {
    const res = await fetch(`${baseUrl}/api/v1/listings/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 }
    });
    if (res.ok) return res.json() as Promise<Listing>;
  } catch {
    // The public catalog remains usable when the optional listing service is unavailable.
  }
  return fallbackListings[id] || null;
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
  const partnerOffer = new AdServerEngine().getContextualAd(listing.category || 'PAY_VIVO');
  const categoryForFlywheel = listing.category === 'VEHICLE' ? 'VEHICLE' : listing.category === 'ELECTRONICS' ? 'ELECTRONICS' : listing.category === 'REAL_ESTATE' ? 'REAL_ESTATE' : 'GENERAL';
  const crossSellRecommendations = new VivoFlywheelEngine().generateCrossSellServices(categoryForFlywheel, listing.price);
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
      <main className="vivo-public-shell mx-auto min-h-screen max-w-4xl px-4 pb-28 py-8 font-sans text-white">
        <div className="mb-4 border-b border-gray-800 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00]">{listing.category || 'MARKETPLACE'}</span>
          <h1 className="mt-1 text-3xl font-bold text-[#FF6A00]">{listing.title}</h1>
        </div>
        <div className="my-2 text-2xl font-semibold tabular-nums">
          Q{listing.price.toLocaleString('es-GT')} GTQ
        </div>
        <TrustBar assetClass={listing.category === 'VEHICLE' ? 'AUTOMOTIVE' : listing.category === 'REAL_ESTATE' ? 'REAL_ESTATE' : 'RETAIL'} amountGTQ={listing.price} />
        <InsuranceShieldBadge partnerName="Seguros El Roble · partner terms required" insuredValueGTQ={listing.price} />
        <div className="vivo-surface mb-4 rounded-2xl p-5">
          <h2 className="mb-2 text-sm font-bold text-gray-400">Descripción</h2>
          <p className="leading-relaxed text-[#7A808A]">{description}</p>
          {listing.sellerName && <p className="mt-3 text-xs text-gray-400">Vendedor: <strong className="text-white">{listing.sellerName}</strong>{listing.isCorporate ? ' · Empresa verificada' : ''}</p>}
        </div>
        <aside className="lg:float-right lg:ml-6 lg:w-72" aria-label="Sponsored partner"><CorporateBillboard {...partnerOffer} targetCategory={listing.category} /></aside>
        <div className="my-4"><OneClickCheckoutBar itemId={listing.id} itemTitle={listing.title} priceGTQ={listing.price} isGoldMember={false} /></div>
        {crossSellRecommendations.length > 0 && <section className="my-4 rounded-2xl border border-gray-800 bg-[#191919] p-4"><h2 className="text-sm font-bold text-[#FF6B00]">Servicios para completar tu compra</h2><div className="mt-3 grid gap-2 sm:grid-cols-2">{crossSellRecommendations.map((recommendation) => <a key={recommendation.serviceType} href={recommendation.actionUrl} className="rounded-xl border border-gray-700 p-3 text-xs transition hover:border-[#FF6B00]"><strong className="text-white">{recommendation.title}</strong><span className="mt-1 block text-gray-400">{recommendation.description}</span></a>)}</div></section>}
        {listing.inspectionScore !== undefined && <InspectionBadge inspectionId={`INSP-${listing.id}`} score={inspectionScore} qrCodeUrl={qrCodeUrl} pdfReportUrl={inspectionPdfUrl} />}
        {(listing.category === 'REAL_ESTATE' || listing.category === 'VEHICLE') && <BankCreditCalculator propertyPriceGTQ={listing.price} />}
        <div className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-4xl gap-3 border-t border-gray-800 bg-[#111111]/90 p-4 backdrop-blur-md">
          <button type="button" className="flex-1 rounded-xl bg-[#FF6A00] py-3.5 text-center text-sm font-extrabold text-black shadow-lg transition-all hover:bg-[#e05d00]">Comprar con Escrow Seguro</button>
        </div>
      </main>
    </>
  );
}
