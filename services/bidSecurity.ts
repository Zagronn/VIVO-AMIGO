export interface BidHoldRequest {
  userId: string;
  cardToken: string;
  bidAmountGTQ: number;
}

export interface BidHoldResult {
  holdId: string;
  userId: string;
  amountHeldGTQ: number;
  status: 'TEMPORARY_HOLD_ACTIVE';
  notice: string;
}

export interface FraudPenaltyResult {
  userId: string;
  penaltyFeeChargedGTQ: number;
  accountStatus: 'PERMANENTLY_BAN_BLACK_LIST';
  reason: string;
  timestamp: string;
}

const BID_HOLD_RATE = 0.01;
const FRAUD_PENALTY_GTQ = 500.00;

export function processBidHoldAndPenalty(req: BidHoldRequest): BidHoldResult {
  if (!req.userId.trim() || !req.cardToken.trim()) throw new Error('userId and cardToken are required');
  if (!Number.isFinite(req.bidAmountGTQ) || req.bidAmountGTQ <= 0) throw new Error('bidAmountGTQ must be greater than zero');

  const holdAmountGTQ = Number((req.bidAmountGTQ * BID_HOLD_RATE).toFixed(2));
  return {
    holdId: `HOLD-${Date.now()}`,
    userId: req.userId,
    amountHeldGTQ: holdAmountGTQ,
    status: 'TEMPORARY_HOLD_ACTIVE',
    notice: `Monto de garantía provisional Q${holdAmountGTQ.toFixed(2)} retenido correctamente.`
  };
}

export function executeFraudPenalty(userId: string, cardToken: string, violationReason: string): FraudPenaltyResult {
  if (!userId.trim() || !cardToken.trim()) throw new Error('userId and cardToken are required');
  if (!violationReason.trim()) throw new Error('violationReason is required');

  return {
    userId,
    penaltyFeeChargedGTQ: FRAUD_PENALTY_GTQ,
    accountStatus: 'PERMANENTLY_BAN_BLACK_LIST',
    reason: violationReason.trim(),
    timestamp: new Date().toISOString()
  };
}
