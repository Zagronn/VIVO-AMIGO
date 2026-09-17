import { SubBrandPage } from '@/components/SubBrandPage';

export const metadata = {
  title: 'VIVO ADS — Marketplace advertising',
};

export default function AdsPage() {
  return (
    <SubBrandPage
      brand="ADS"
      tagline="Marketplace advertising to reach shoppers where they browse."
      description="VIVO ADS gives sellers a way to put their products and listings in front of shoppers who are already browsing VIVO AMIGO — no separate ad network to learn, just a boost on the pages people already visit."
      features={[
        {
          title: 'Featured placement',
          description: 'Promoted products can surface higher in category pages and the homepage\'s featured section.',
        },
        {
          title: 'Built for sellers, not agencies',
          description: 'Designed so an individual seller can run a campaign in minutes, without needing a marketing team.',
        },
        {
          title: 'Pay for results',
          description: 'The roadmap ties spend to clicks and conversions tracked back through VIVO AMIGO\'s own order data.',
        },
      ]}
      ctaLabel="Browse the marketplace"
      ctaHref="/products"
    />
  );
}
