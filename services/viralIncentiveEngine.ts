export interface ViralIncentiveRequest {
  userId: string;
  transactionId: string;
  grossAmountGTQ: number;
  socialShareVerified: boolean;
  walletPaymentUsed: boolean;
  campaignId: string;
}

export interface ViralIncentiveDecision {
  baseCommissionBps: 450;
  appliedCommissionBps: number;
  commissionRate: number;
  socialShareDiscountBps: number;
  walletUsageDiscountBps: number;
  platformFeeGTQ: number;
  sellerPayoutGTQ: number;
  policyVersion: string;
  eventId: string;
}

const POLICY_VERSION = 'VIRAL-WALLET-2026-01';
const BASE_COMMISSION_BPS = 450;
const SOCIAL_SHARE_DISCOUNT_BPS = 150;
const WALLET_USAGE_DISCOUNT_BPS = 100;

function required(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} is required`);
  return value.trim();
}

export function calculateViralIncentive(request: ViralIncentiveRequest): ViralIncentiveDecision {
  required(request.userId, 'userId');
  required(request.transactionId, 'transactionId');
  required(request.campaignId, 'campaignId');
  if (!Number.isFinite(request.grossAmountGTQ) || request.grossAmountGTQ <= 0) throw new Error('grossAmountGTQ must be greater than zero');
  const appliedCommissionBps = Math.max(0, BASE_COMMISSION_BPS - (request.socialShareVerified ? SOCIAL_SHARE_DISCOUNT_BPS : 0) - (request.walletPaymentUsed ? WALLET_USAGE_DISCOUNT_BPS : 0));
  const grossAmountGTQ = Number(request.grossAmountGTQ.toFixed(2));
  const platformFeeGTQ = Number((grossAmountGTQ * appliedCommissionBps / 10_000).toFixed(2));
  return {
    baseCommissionBps: BASE_COMMISSION_BPS,
    appliedCommissionBps,
    commissionRate: appliedCommissionBps / 10_000,
    socialShareDiscountBps: request.socialShareVerified ? SOCIAL_SHARE_DISCOUNT_BPS : 0,
    walletUsageDiscountBps: request.walletPaymentUsed ? WALLET_USAGE_DISCOUNT_BPS : 0,
    platformFeeGTQ,
    sellerPayoutGTQ: Number((grossAmountGTQ - platformFeeGTQ).toFixed(2)),
    policyVersion: POLICY_VERSION,
    eventId: `INCENTIVE-${request.transactionId}-${request.campaignId}`
  };
}