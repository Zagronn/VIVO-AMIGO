import type { SellerAnalytics, SellerKnowledgeBase, StoreInventory } from '../types/sellerData';

const inventory: StoreInventory[] = [
  { inventoryId: 'INV-1', storeId: 'store-demo', listingId: 'cafe-altura', title: 'Café de altura 500g', priceGTQ: 18, stock: 84, variants: ['500g'], status: 'ACTIVE' },
  { inventoryId: 'INV-2', storeId: 'store-demo', listingId: 'canasta-tejida', title: 'Canasta tejida', priceGTQ: 145, stock: 12, variants: ['Natural', 'Grande'], status: 'ACTIVE' },
  { inventoryId: 'INV-3', storeId: 'store-demo', listingId: 'miel-abeja', title: 'Miel de abeja', priceGTQ: 42, stock: 0, variants: ['250ml'], status: 'OUT_OF_STOCK' }
];

export function getSellerAnalytics(sellerId = 'seller-demo'): SellerAnalytics {
  return { sellerId, totalGmvGTQ: 84250, netEarningsGTQ: 76767.5, grossCommissionGTQ: 7482.5, returnCancellationRate: 2.4, topProducts: [{ listingId: 'cafe-altura', title: 'Café de altura 500g', unitsSold: 148, gmvGTQ: 2664 }, { listingId: 'canasta-tejida', title: 'Canasta tejida', unitsSold: 42, gmvGTQ: 6090 }], storeRating: 4.8 };
}

export function getSellerKnowledgeBase(sellerId = 'seller-demo'): SellerKnowledgeBase {
  const analytics = getSellerAnalytics(sellerId);
  return { profile: { sellerId, storeId: 'store-demo', storeName: 'La Esquina', legalName: 'La Esquina Comercial, S.A.', verificationStatus: 'VERIFIED', commissionRateBps: 450, rating: analytics.storeRating, contactEmail: 'seller@vivoamigo.com' }, verificationDocuments: [{ documentId: 'DOC-1', type: 'NIT', status: 'VERIFIED', documentUrl: '/admin/documents/nit-demo' }], inventory, cargoIntegrations: [{ integrationId: 'CARGO-1', carrier: 'CARGO_VIVO', trackingCode: 'CV-2026-1001', status: 'IN_TRANSIT' }], payouts: [{ payoutId: 'PAY-1', sellerId, grossGTQ: 2840, commissionGTQ: 127.8, netGTQ: 2712.2, status: 'PENDING', requestedAt: '2026-09-09' }], analytics };
}
