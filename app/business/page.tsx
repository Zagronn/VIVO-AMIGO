import { SubBrandPage } from '@/components/SubBrandPage';

export const metadata = {
  title: 'VIVO BUSINESS — Seller tools',
};

export default function BusinessPage() {
  return (
    <SubBrandPage
      brand="BUSINESS"
      tagline="Seller tools — inventory, analytics, and payouts."
      description="VIVO BUSINESS is the seller side of VIVO AMIGO: apply to sell, list products, watch stock levels, and track how your store is performing — all from one dashboard."
      features={[
        {
          title: 'Simple onboarding',
          description: 'Apply from any account, get approved by the VIVO AMIGO team, and start listing — no complicated paperwork.',
        },
        {
          title: 'Inventory at a glance',
          description: 'Every product tracks its own stock and active/inactive status, so a seller always knows what\'s sellable.',
        },
        {
          title: 'Backed by the whole ecosystem',
          description: 'Payments, shipping and classifieds all run through the same account — one login for everything a seller needs.',
        },
      ]}
      ctaLabel="Become a seller"
      ctaHref="/sell"
    />
  );
}
