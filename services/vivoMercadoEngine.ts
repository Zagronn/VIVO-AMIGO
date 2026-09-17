export interface B2BImportExportDeal {
  dealId: string;
  supplierCountry: 'TR' | 'CN';
  buyerCountry: 'GT';
  escrowAmountUSD: number;
  currency: 'USD' | 'GTQ' | 'TRY' | 'CNY';
  veriShieldApproved: boolean;
  status: 'PENDING_ESCROW' | 'IN_TRANSIT' | 'DELIVERED_RELEASED';
}

export interface TradeInLoanRequest {
  userId: string;
  assetType: 'VEHICLE' | 'REAL_ESTATE' | 'ELECTRONICS';
  assetAppraisedValueGTQ: number;
  targetAssetPriceGTQ: number;
  payVivoCreditScore: number;
}

export interface CrossBorderEscrowResult {
  escrowStatus: 'FUNDS_LOCKED_IN_PAY_VIVO';
  releaseCondition: 'VERI_SHIELD_CARGO_INSPECTION_PASSED';
  timestamp: string;
}

export interface TradeInLoanResult {
  approval: boolean;
  loanRequiredGTQ: number;
  monthlyPaymentGTQ: number | null;
  veriShieldSeal: 'VERIFIED_ZERO_TRUST';
  status: 'NO_FINANCING_REQUIRED' | 'CREDIT_ELIGIBILITY_REVIEW';
}

const MIN_CREDIT_SCORE = 650;
const TERM_MONTHS = 48;
const FINANCE_FACTOR = 1.08;

function required(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} is required`);
  return value.trim();
}

export class VivoMercadoEngine {
  public initializeCrossBorderEscrow(deal: B2BImportExportDeal): CrossBorderEscrowResult {
    required(deal.dealId, 'dealId');
    if (!['TR', 'CN'].includes(deal.supplierCountry) || deal.buyerCountry !== 'GT') throw new Error('Unsupported trade corridor');
    if (!Number.isFinite(deal.escrowAmountUSD) || deal.escrowAmountUSD <= 0) throw new Error('escrowAmountUSD must be greater than zero');
    if (!['USD', 'GTQ', 'TRY', 'CNY'].includes(deal.currency)) throw new Error('Unsupported settlement currency');
    if (deal.status !== 'PENDING_ESCROW') throw new Error('deal must be PENDING_ESCROW before escrow initialization');
    if (!deal.veriShieldApproved) throw new Error('VERI-SHIELD: unapproved suppliers cannot initiate cross-border escrow.');
    return { escrowStatus: 'FUNDS_LOCKED_IN_PAY_VIVO', releaseCondition: 'VERI_SHIELD_CARGO_INSPECTION_PASSED', timestamp: new Date().toISOString() };
  }

  public calculateTradeInDifference(request: TradeInLoanRequest): TradeInLoanResult {
    required(request.userId, 'userId');
    if (!['VEHICLE', 'REAL_ESTATE', 'ELECTRONICS'].includes(request.assetType)) throw new Error('Unsupported asset type');
    if (!Number.isFinite(request.assetAppraisedValueGTQ) || request.assetAppraisedValueGTQ <= 0) throw new Error('assetAppraisedValueGTQ must be greater than zero');
    if (!Number.isFinite(request.targetAssetPriceGTQ) || request.targetAssetPriceGTQ <= 0) throw new Error('targetAssetPriceGTQ must be greater than zero');
    if (!Number.isInteger(request.payVivoCreditScore) || request.payVivoCreditScore < 300 || request.payVivoCreditScore > 850) throw new Error('payVivoCreditScore must be between 300 and 850');
    const loanRequiredGTQ = Number(Math.max(0, request.targetAssetPriceGTQ - request.assetAppraisedValueGTQ).toFixed(2));
    if (loanRequiredGTQ === 0) return { approval: true, loanRequiredGTQ: 0, monthlyPaymentGTQ: 0, veriShieldSeal: 'VERIFIED_ZERO_TRUST', status: 'NO_FINANCING_REQUIRED' };
    const eligibleForReview = request.payVivoCreditScore >= MIN_CREDIT_SCORE;
    return { approval: eligibleForReview, loanRequiredGTQ, monthlyPaymentGTQ: eligibleForReview ? Number(((loanRequiredGTQ / TERM_MONTHS) * FINANCE_FACTOR).toFixed(2)) : null, veriShieldSeal: 'VERIFIED_ZERO_TRUST', status: 'CREDIT_ELIGIBILITY_REVIEW' };
  }
}