import { SubBrandPage } from '@/components/SubBrandPage';

export const metadata = {
  title: 'VIVO SHIP — Logistics and fleet tracking',
};

export default function ShipPage() {
  return (
    <SubBrandPage
      brand="SHIP"
      tagline="Logistics and fleet tracking for last-mile delivery."
      description="Once an order is paid, VIVO SHIP takes over: dispatching a shipment, assigning a carrier, and generating a tracking code the buyer can follow all the way to their door."
      features={[
        {
          title: 'Carrier dispatch',
          description: 'Admins dispatch paid orders straight from the order page, choosing a carrier and generating a tracking code automatically.',
        },
        {
          title: 'Real-time status',
          description: 'Every shipment carries a status — dispatched, delivered — visible to the buyer on their order page at any time.',
        },
        {
          title: 'Built for the region',
          description: 'Designed around the reality of last-mile delivery across Latin American cities, where address formats and carrier coverage vary widely.',
        },
      ]}
      ctaLabel="Track an order"
      ctaHref="/orders"
    />
  );
}
