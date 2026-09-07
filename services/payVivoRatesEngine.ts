export interface BankComparisonResult {
  amountGTQ: number;
  targetCurrency: 'USD' | 'EUR' | 'TRY' | 'CNY';
  payVivoFeeUSD: number;
  avgBankFeeUSD: number;
  userSavingsUSD: number;
  conversionRate: number;
}

const RATE_SNAPSHOT: Record<BankComparisonResult['targetCurrency'], number> = {
  USD: 0.13,
  EUR: 0.12,
  TRY: 4.42,
  CNY: 0.92
};

export class PayVivoRatesEngine {
  public calculateComparison(amountGTQ: number, targetCurrency: BankComparisonResult['targetCurrency']): BankComparisonResult {
    if (!Number.isFinite(amountGTQ) || amountGTQ <= 0) throw new Error('amountGTQ must be greater than zero');
    const rate = RATE_SNAPSHOT[targetCurrency];
    if (!rate) throw new Error('unsupported target currency');
    const convertedAmount = amountGTQ * rate;
    const payVivoFeeUSD = 5 + convertedAmount * 0.0075;
    const avgBankFeeUSD = 45 + convertedAmount * 0.035;
    const userSavingsUSD = Math.max(0, Math.round(avgBankFeeUSD - payVivoFeeUSD));
    return {
      amountGTQ: Number(amountGTQ.toFixed(2)),
      targetCurrency,
      payVivoFeeUSD: Number(payVivoFeeUSD.toFixed(2)),
      avgBankFeeUSD: Number(avgBankFeeUSD.toFixed(2)),
      userSavingsUSD,
      conversionRate: rate
    };
  }
}