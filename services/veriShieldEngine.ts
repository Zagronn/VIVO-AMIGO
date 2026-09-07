import type { SecurityBadge } from '../types/vivoAmigoModels';

const BASE_COMMISSION_RATE = 10;
const SOCIAL_SHARE_DISCOUNT = 2.5;
const PAYVIVO_DISCOUNT = 3;
const MIN_COMMISSION_RATE = 4.5;
const MAX_ALLOWED_DEVIATION = 0.4;

export class VeriShieldEngine {
  public calculateDynamicCommission(sharedOnSocial: boolean, usedPayVivo: boolean): number {
    let rate = BASE_COMMISSION_RATE;
    if (sharedOnSocial) rate -= SOCIAL_SHARE_DISCOUNT;
    if (usedPayVivo) rate -= PAYVIVO_DISCOUNT;
    return Math.max(Number(rate.toFixed(2)), MIN_COMMISSION_RATE);
  }

  public inspectListing(priceGTQ: number, averageMarketPriceGTQ: number): SecurityBadge {
    if (!Number.isFinite(priceGTQ) || priceGTQ <= 0) throw new Error('priceGTQ must be greater than zero');
    if (!Number.isFinite(averageMarketPriceGTQ) || averageMarketPriceGTQ <= 0) throw new Error('averageMarketPriceGTQ must be greater than zero');
    const deviation = Math.abs(priceGTQ - averageMarketPriceGTQ) / averageMarketPriceGTQ;
    return deviation > MAX_ALLOWED_DEVIATION ? 'FLAGGED' : 'VERI_SHIELD_APPROVED';
  }
}