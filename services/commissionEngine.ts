export type TransactionType = 'VEHICLE_SALE' | 'REAL_ESTATE_SALE' | 'SERVICE_JOB' | 'WHOLESALE' | 'ESCROW_PAYMENT' | 'BYD_LEAD';

export interface FeeCalculationInput {
  type: TransactionType;
  amountGTQ: number;
  isGoldSubscriber?: boolean;
}

export interface FeeCalculation {
  transactionType: TransactionType;
  grossAmountGTQ: number;
  platformFeeBps: number;
  platformFeeGTQ: number;
  sellerPayoutGTQ: number;
  isGoldSubscriber: boolean;
}

const FEE_BPS: Record<TransactionType, number> = {
  VEHICLE_SALE: 100,
  REAL_ESTATE_SALE: 50,
  SERVICE_JOB: 750,
  WHOLESALE: 50,
  ESCROW_PAYMENT: 300,
  BYD_LEAD: 10_000
};

export function calculateVivoAmigoFee(input: FeeCalculationInput): FeeCalculation {
  if (!Number.isFinite(input.amountGTQ) || input.amountGTQ <= 0) throw new Error('amountGTQ must be greater than zero');
  const baseBps = FEE_BPS[input.type];
  if (baseBps === undefined) throw new Error('unsupported transaction type');

  const isGoldSubscriber = Boolean(input.isGoldSubscriber);
  const platformFeeBps = isGoldSubscriber && input.type === 'WHOLESALE' ? Math.floor(baseBps / 2) : baseBps;
  const grossAmountGTQ = Number(input.amountGTQ.toFixed(2));
  const platformFeeGTQ = Number((grossAmountGTQ * platformFeeBps / 10_000).toFixed(2));

  return {
    transactionType: input.type,
    grossAmountGTQ,
    platformFeeBps,
    platformFeeGTQ,
    sellerPayoutGTQ: Number((grossAmountGTQ - platformFeeGTQ).toFixed(2)),
    isGoldSubscriber
  };
}
