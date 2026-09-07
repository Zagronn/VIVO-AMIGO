import type { BICreditApplication } from './bancoIndustrialBridge';

export type TradeInAssetType = 'VEHICLE' | 'REAL_ESTATE' | 'TECH_DEVICE';

export interface TradeInInput {
  userId: string;
  currentAssetType: TradeInAssetType;
  currentAssetVerifiedValueGTQ: number;
  targetAssetType: TradeInAssetType;
  targetAssetPriceGTQ: number;
  veriShieldScore: number;
}

export interface TradeInCalculation {
  tradeInCreditGTQ: number;
  financingGapGTQ: number;
  equityPosition: 'CREDIT_COVERS_TARGET' | 'FINANCING_REQUIRED';
  biApplication: BICreditApplication | null;
  cargoDeliveryUrl: string;
  campaign: string;
}

function validInput(input: TradeInInput): boolean {
  return typeof input.userId === 'string' && input.userId.trim() !== ''
    && ['VEHICLE', 'REAL_ESTATE', 'TECH_DEVICE'].includes(input.currentAssetType)
    && ['VEHICLE', 'REAL_ESTATE', 'TECH_DEVICE'].includes(input.targetAssetType)
    && Number.isFinite(input.currentAssetVerifiedValueGTQ) && input.currentAssetVerifiedValueGTQ > 0
    && Number.isFinite(input.targetAssetPriceGTQ) && input.targetAssetPriceGTQ > 0
    && Number.isFinite(input.veriShieldScore) && input.veriShieldScore >= 0 && input.veriShieldScore <= 100;
}

export function calculateTradeInUpgrade(input: TradeInInput): TradeInCalculation {
  if (!validInput(input)) throw new Error('Trade-in asset, verified values, user, and score are required');
  const financingGapGTQ = Math.max(0, Number((input.targetAssetPriceGTQ - input.currentAssetVerifiedValueGTQ).toFixed(2)));
  return {
    tradeInCreditGTQ: Number(input.currentAssetVerifiedValueGTQ.toFixed(2)),
    financingGapGTQ,
    equityPosition: financingGapGTQ === 0 ? 'CREDIT_COVERS_TARGET' : 'FINANCING_REQUIRED',
    biApplication: financingGapGTQ > 0 && input.targetAssetType !== 'TECH_DEVICE' ? {
      userId: input.userId,
      assetType: input.targetAssetType,
      assetVerifiedValueGTQ: input.targetAssetPriceGTQ,
      veriShieldScore: input.veriShieldScore,
      requestedLoanAmountGTQ: financingGapGTQ
    } : null,
    cargoDeliveryUrl: 'https://cargovivo.com/dispatch/trade-in',
    campaign: 'vivoamigo ile Hayatını Güncelle'
  };
}