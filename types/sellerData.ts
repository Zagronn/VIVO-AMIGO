export interface SellerProfile {
  sellerId: string;
  storeId: string;
  storeName: string;
  legalName: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  commissionRateBps: number;
  rating: number;
  contactEmail: string;
}

export interface StoreInventory {
  inventoryId: string;
  storeId: string;
  listingId: string;
  title: string;
  priceGTQ: number;
  stock: number;
  variants: string[];
  status: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';
}

export interface SellerPayouts {
  payoutId: string;
  sellerId: string;
  grossGTQ: number;
  commissionGTQ: number;
  netGTQ: number;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'HELD';
  requestedAt: string;
}

export interface SellerAnalytics {
  sellerId: string;
  totalGmvGTQ: number;
  netEarningsGTQ: number;
  grossCommissionGTQ: number;
  returnCancellationRate: number;
  topProducts: Array<{ listingId: string; title: string; unitsSold: number; gmvGTQ: number }>;
  storeRating: number;
}

export interface SellerKnowledgeBase {
  profile: SellerProfile;
  verificationDocuments: Array<{ documentId: string; type: 'NIT' | 'MERCANTILE_REGISTRATION' | 'TAX_CERTIFICATE'; status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED'; documentUrl: string }>;
  inventory: StoreInventory[];
  cargoIntegrations: Array<{ integrationId: string; carrier: 'CARGO_VIVO'; trackingCode?: string; status: 'READY' | 'IN_TRANSIT' | 'DELIVERED' }>;
  payouts: SellerPayouts[];
  analytics: SellerAnalytics;
}
