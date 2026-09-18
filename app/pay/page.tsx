import { SubBrandPage } from '@/components/SubBrandPage';

export const metadata = {
  title: 'VIVO PAY — Escrow-backed payments for VIVO AMIGO',
};

export default function PayPage() {
  return (
    <SubBrandPage
      brand="PAY"
      tagline="Escrow-backed payments built for cross-border trade."
      description="Every order placed on VIVO AMIGO runs through VIVO PAY: funds are held until an order is confirmed, so buyers and sellers across borders can trust the transaction without knowing each other."
      features={[
        {
          title: 'Escrow by default',
          description: 'Payment is captured at checkout and only released to the seller once the order is marked delivered or completed.',
        },
        {
          title: 'Multiple local rails',
          description: 'Built to support cards, bank transfers, and local payment methods across Latin America — the mock gateway in this build stands in for those integrations.',
        },
        {
          title: 'Full transaction history',
          description: 'Every payment is tied to its order, with status, gateway, and amount always visible on the order page.',
        },
      ]}
      ctaLabel="See it in action — shop the marketplace"
      ctaHref="/products"
    />
  );
}
