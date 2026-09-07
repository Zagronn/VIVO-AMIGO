export interface PayVivoWalletState {
  walletId: string;
  userUuid: string;
  balanceGTQ: number;
  isBiometricAuthEnabled: boolean;
  veriShieldTrustBadge: boolean;
  commissionRate: number;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  category: 'ELECTRONICS' | 'VEHICLES' | 'REAL_ESTATE';
  priceGTQ: number;
  veriShieldPriceCheckStatus: 'APPROVED' | 'FLAGGED_EXCESSIVE';
  sellerBadge: 'VERIFIED_TRUSTED' | 'STANDARD';
  imageUrl: string;
}

const BASE_COMMISSION_RATE = 10;
const MIN_COMMISSION_RATE = 4.5;
const SOCIAL_SHARE_DISCOUNT = 2.5;
const PAYVIVO_DISCOUNT = 3;

export function calculatePayVivoCommission(sharedOnSocial: boolean, usedPayVivo: boolean): number {
  let rate = BASE_COMMISSION_RATE;
  if (sharedOnSocial) rate -= SOCIAL_SHARE_DISCOUNT;
  if (usedPayVivo) rate -= PAYVIVO_DISCOUNT;
  return Math.max(Number(rate.toFixed(2)), MIN_COMMISSION_RATE);
}

export function validatePayVivoWalletState(wallet: PayVivoWalletState): PayVivoWalletState {
  if (!wallet.walletId.trim() || !wallet.userUuid.trim()) throw new Error('walletId and userUuid are required');
  if (!Number.isFinite(wallet.balanceGTQ) || wallet.balanceGTQ < 0) throw new Error('balanceGTQ must be non-negative');
  if (!Number.isFinite(wallet.commissionRate) || wallet.commissionRate < MIN_COMMISSION_RATE || wallet.commissionRate > BASE_COMMISSION_RATE) throw new Error('commissionRate must be between 4.5 and 10');
  return { ...wallet };
}

export function validateMarketplaceListing(listing: MarketplaceListing): MarketplaceListing {
  if (!listing.id.trim() || !listing.title.trim() || !listing.imageUrl.trim()) throw new Error('listing identity and imageUrl are required');
  if (!Number.isFinite(listing.priceGTQ) || listing.priceGTQ <= 0) throw new Error('priceGTQ must be greater than zero');
  if (listing.veriShieldPriceCheckStatus === 'FLAGGED_EXCESSIVE') throw new Error('VERI-SHIELD flagged excessive listing price');
  return { ...listing };
}