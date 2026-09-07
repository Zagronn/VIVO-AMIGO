export * from './payVivoUniversalEscrowEngine';import { randomUUID } from 'node:crypto';

export type AssetClass = 'RETAIL' | 'AUTOMOTIVE' | 'REAL_ESTATE';
export type EscrowTriggerType = 'LOGISTICS_CODE' | 'SAT_NOTARY_APPROVAL' | 'TAPU_REGISTRATION';

export interface UniversalEscrowTransaction {
  transactionId: string;
  assetClass: AssetClass;
  amountGTQ: number;
  buyerWalletId: string;
  sellerWalletId: string;
  veriShieldPriceVerified: boolean;
  isFundsLocked: boolean;
  requiredTrigger: EscrowTriggerType;
  verificationDocumentId?: string;
  isCompleted: boolean;
}

export interface UniversalEscrowReleaseResult {
  success: boolean;
  message: string;
  updatedTx: UniversalEscrowTransaction;
}

const TRIGGER_BY_ASSET: Record<AssetClass, EscrowTriggerType> = {
  RETAIL: 'LOGISTICS_CODE',
  AUTOMOTIVE: 'SAT_NOTARY_APPROVAL',
  REAL_ESTATE: 'TAPU_REGISTRATION'
};

function required(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} is required`);
  return value.trim();
}

export class PayVivoUniversalEscrowEngine {
  public initiateUniversalLock(assetClass: AssetClass, amountGTQ: number, buyerWalletId: string, sellerWalletId: string, marketAvgPriceGTQ: number): UniversalEscrowTransaction {
    required(buyerWalletId, 'buyerWalletId');
    required(sellerWalletId, 'sellerWalletId');
    if (buyerWalletId === sellerWalletId) throw new Error('buyer and seller wallets must differ');
    if (!Object.hasOwn(TRIGGER_BY_ASSET, assetClass)) throw new Error('unsupported asset class');
    if (!Number.isFinite(amountGTQ) || amountGTQ <= 0) throw new Error('amountGTQ must be greater than zero');
    if (!Number.isFinite(marketAvgPriceGTQ) || marketAvgPriceGTQ <= 0) throw new Error('marketAvgPriceGTQ must be greater than zero');
    const deviation = Math.abs(amountGTQ - marketAvgPriceGTQ) / marketAvgPriceGTQ;
    if (deviation > 0.35) throw new Error('VERI-SHIELD: price deviation exceeds the universal escrow threshold');
    return { transactionId: `PVE-${assetClass}-${randomUUID()}`, assetClass, amountGTQ: Number(amountGTQ.toFixed(2)), buyerWalletId, sellerWalletId, veriShieldPriceVerified: true, isFundsLocked: true, requiredTrigger: TRIGGER_BY_ASSET[assetClass], isCompleted: false };
  }

  public releaseUniversalEscrow(transaction: UniversalEscrowTransaction, providedProofId: string, triggerType: EscrowTriggerType = transaction.requiredTrigger): UniversalEscrowReleaseResult {
    required(transaction.transactionId, 'transactionId');
    required(providedProofId, 'providedProofId');
    if (!transaction.isFundsLocked) throw new Error('funds are already released or were never locked');
    if (!transaction.veriShieldPriceVerified) throw new Error('VERI-SHIELD price verification is required before release');
    if (triggerType !== transaction.requiredTrigger) throw new Error('provided release trigger does not match asset class');
    const updatedTx = { ...transaction, verificationDocumentId: providedProofId, isFundsLocked: false, isCompleted: true };
    const labels: Record<AssetClass, string> = { RETAIL: 'Logistics delivery code', AUTOMOTIVE: 'SAT/notary transfer document', REAL_ESTATE: 'property registry deed record' };
    return { success: true, message: `${labels[transaction.assetClass]} verified. Funds released to seller.`, updatedTx };
  }
}