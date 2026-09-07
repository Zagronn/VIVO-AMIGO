export type CategoryType = 'ELECTRONICS' | 'VEHICLES' | 'REAL_ESTATE' | 'HEAVY_B2B';

export type SecurityBadge = 'VERI_SHIELD_APPROVED' | 'PENDING_INSPECTION' | 'FLAGGED';

export interface UserWallet {
  walletId: string;
  userUuid: string;
  balanceGTQ: number;
  vivoScore: number;
  isBiometricActive: boolean;
}

export interface ListingItem {
  id: string;
  title: string;
  category: CategoryType;
  priceGTQ: number;
  veriShieldStatus: SecurityBadge;
  sellerRating: number;
  slug: string;
}

export interface AdOffer {
  id: string;
  partnerName: string;
  headline: string;
  subtext: string;
  ctaText: string;
  logoUrl: string;
  partnerLink: string;
  categoryMatch: CategoryType;
}