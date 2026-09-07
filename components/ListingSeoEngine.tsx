import React from 'react';

interface SeoProps {
  title: string;
  description: string;
  canonicalUrl: string;
  priceGTQ: number;
  imageUrl: string;
  category: string;
}

function required(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} is required`);
  return value.trim();
}

function validHttpsUrl(value: string, field: string): string {
  const url = required(value, field);
  if (!/^https:\/\//i.test(url)) throw new Error(`${field} must use HTTPS`);
  return url;
}

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export function createListingSeoTitle(title: string, location = 'Guatemala'): string {
  return `Garantizado ${required(title, 'title')} ${required(location, 'location')} - VIVO AMIGO`;
}

export const ListingSeoEngine = ({ title, description, canonicalUrl, priceGTQ, imageUrl, category }: SeoProps) => {
  const safeTitle = createListingSeoTitle(title);
  const safeDescription = required(description, 'description');
  const safeCanonicalUrl = validHttpsUrl(canonicalUrl, 'canonicalUrl');
  const safeImageUrl = validHttpsUrl(imageUrl, 'imageUrl');
  if (!Number.isFinite(priceGTQ) || priceGTQ < 0) throw new Error('priceGTQ must be non-negative');
  const jsonLdData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: safeTitle,
    image: [safeImageUrl],
    description: safeDescription,
    category: required(category, 'category'),
    offers: {
      '@type': 'Offer',
      url: safeCanonicalUrl,
      priceCurrency: 'GTQ',
      price: Number(priceGTQ.toFixed(2)),
      itemCondition: 'https://schema.org/UsedCondition',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'VIVO AMIGO VERI-SHIELD Verified' }
    }
  };

  return <>
    <title>{`${safeTitle} | VIVO AMIGO Guatemala`}</title>
    <meta name="description" content={safeDescription} />
    <link rel="canonical" href={safeCanonicalUrl} />
    <meta property="og:title" content={safeTitle} />
    <meta property="og:description" content={safeDescription} />
    <meta property="og:image" content={safeImageUrl} />
    <meta property="og:url" content={safeCanonicalUrl} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLdData) }} />
  </>;
};