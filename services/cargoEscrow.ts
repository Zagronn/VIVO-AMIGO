export type CargoStatus = 'PENDING_PICKUP' | 'IN_TRANSIT' | 'DELIVERED' | 'DISPUTED';
export type CargoCarrier = 'CARGO_EXPRESO' | 'GUATE_EX' | 'CARGO_VIVO';

export interface EscrowShipment {
  transactionId: string;
  trackingNumber: string;
  carrier: CargoCarrier;
  status: CargoStatus;
  amountLockedGTQ: number;
  deliveredAt?: string;
  isPayoutApproved: boolean;
}

const PAYOUT_HOLD_HOURS = 24;

export async function syncCargoAndReleaseEscrow(shipment: EscrowShipment, now = new Date()): Promise<EscrowShipment> {
  if (!shipment.transactionId.trim() || !shipment.trackingNumber.trim()) throw new Error('transactionId and trackingNumber are required');
  if (!Number.isFinite(shipment.amountLockedGTQ) || shipment.amountLockedGTQ < 0) throw new Error('amountLockedGTQ must be non-negative');
  if (shipment.status === 'DISPUTED' && shipment.isPayoutApproved) throw new Error('disputed shipment cannot have an approved payout');
  if (shipment.status !== 'DELIVERED' || !shipment.deliveredAt || shipment.isPayoutApproved) return { ...shipment };

  const deliveryTime = new Date(shipment.deliveredAt).getTime();
  if (!Number.isFinite(deliveryTime)) throw new Error('deliveredAt must be a valid ISO date');
  const hoursSinceDelivery = (now.getTime() - deliveryTime) / (1000 * 60 * 60);
  if (hoursSinceDelivery < PAYOUT_HOLD_HOURS) return { ...shipment };

  return { ...shipment, isPayoutApproved: true };
}
