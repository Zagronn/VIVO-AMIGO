export interface CurrencyRate {
  pair: 'GTQ/USD' | 'GTQ/EUR' | 'GTQ/TRY' | 'GTQ/CNY';
  midMarketRate: number;
  ourMarginPercent: number;
}

export interface InternationalTransferRequest {
  senderWalletId: string;
  recipientAccount: string;
  sourceAmountGTQ: number;
  targetCurrency: 'USD' | 'EUR' | 'TRY' | 'CNY';
  deliveryMethod: 'SWIFT_PARTNER' | 'DIRECT_P2P';
}

export interface TransferQuote {
  sourceGTQ: number;
  targetCurrency: 'USD' | 'EUR' | 'TRY' | 'CNY';
  convertedAmount: number;
  appliedRate: number;
  feeGTQ: number;
  estimatedSettlement: 'WITHIN_24_HOURS';
}

export interface LocalTransferResult {
  success: true;
  deductedAmountGTQ: number;
  feeGTQ: number;
  estimatedSettlement: 'INSTANT_1_SECOND' | 'SAME_DAY_ACH';
}

export interface CrossBorderRateResult {
  sourceGTQ: number;
  targetCurrency: 'USD' | 'EUR' | 'TRY' | 'CNY';
  receivedAmount: number;
  appliedExchangeRate: number;
  marginPercent: number;
  estimatedTraditionalBankComparisonGTQ: number;
  deliveryMethod: InternationalTransferRequest['deliveryMethod'];
}

const RATES: Record<string, CurrencyRate> = {
  'GTQ/USD': { pair: 'GTQ/USD', midMarketRate: 0.13, ourMarginPercent: 0.0075 },
  'GTQ/EUR': { pair: 'GTQ/EUR', midMarketRate: 0.12, ourMarginPercent: 0.0075 },
  'GTQ/TRY': { pair: 'GTQ/TRY', midMarketRate: 4.42, ourMarginPercent: 0.0075 },
  'GTQ/CNY': { pair: 'GTQ/CNY', midMarketRate: 0.92, ourMarginPercent: 0.0075 }
};

function required(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} is required`);
  return value.trim();
}

export class PayVivoTransferManager {
  public readonly rates = { ...RATES };

  public executeLocalTransfer(amountGTQ: number, isPayVivoInternal: boolean): LocalTransferResult {
    if (!Number.isFinite(amountGTQ) || amountGTQ <= 0) throw new Error('amountGTQ must be greater than zero');
    const feeGTQ = isPayVivoInternal ? 0 : 5;
    return { success: true, deductedAmountGTQ: Number((amountGTQ + feeGTQ).toFixed(2)), feeGTQ, estimatedSettlement: isPayVivoInternal ? 'INSTANT_1_SECOND' : 'SAME_DAY_ACH' };
  }

  public processLocalTransfer(amountGTQ: number, isPayVivoInternal: boolean) {
    const transfer = this.executeLocalTransfer(amountGTQ, isPayVivoInternal);
    return { success: transfer.success, netDebited: transfer.deductedAmountGTQ, feeGTQ: transfer.feeGTQ, settlementTime: isPayVivoInternal ? 'INSTANT' as const : 'SAME_DAY_ACH' as const };
  }

  public getInternationalQuote(amountGTQ: number, targetCurrency: TransferQuote['targetCurrency']): TransferQuote {
    if (!Number.isFinite(amountGTQ) || amountGTQ <= 0) throw new Error('amountGTQ must be greater than zero');
    const rateData = this.rates[`GTQ/${targetCurrency}`];
    if (!rateData) throw new Error('unsupported target currency');
    const effectiveRate = rateData.midMarketRate * (1 - 0.0075);
    return { sourceGTQ: Number(amountGTQ.toFixed(2)), targetCurrency, convertedAmount: Number((amountGTQ * effectiveRate).toFixed(2)), appliedRate: Number(effectiveRate.toFixed(4)), feeGTQ: 35, estimatedSettlement: 'WITHIN_24_HOURS' };
  }

  public calculateCrossBorderRate(request: InternationalTransferRequest): CrossBorderRateResult {
    required(request.senderWalletId, 'senderWalletId');
    required(request.recipientAccount, 'recipientAccount');
    if (!Number.isFinite(request.sourceAmountGTQ) || request.sourceAmountGTQ <= 0) throw new Error('sourceAmountGTQ must be greater than zero');
    if (!['USD', 'EUR', 'TRY', 'CNY'].includes(request.targetCurrency)) throw new Error('unsupported target currency');
    const rateData = this.rates[`GTQ/${request.targetCurrency}`];
    if (!rateData) throw new Error('unsupported currency pair');
    const effectiveRate = rateData.midMarketRate * (1 - rateData.ourMarginPercent);
    return {
      sourceGTQ: Number(request.sourceAmountGTQ.toFixed(2)),
      targetCurrency: request.targetCurrency,
      receivedAmount: Number((request.sourceAmountGTQ * effectiveRate).toFixed(2)),
      appliedExchangeRate: Number(effectiveRate.toFixed(4)),
      marginPercent: rateData.ourMarginPercent,
      estimatedTraditionalBankComparisonGTQ: Math.round(request.sourceAmountGTQ * 0.04),
      deliveryMethod: request.deliveryMethod
    };
  }
}