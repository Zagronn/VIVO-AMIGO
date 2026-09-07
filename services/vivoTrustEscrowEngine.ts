import { randomUUID } from 'node:crypto';

export type EscrowStatus = 'FUNDS_LOCKED' | 'IN_TRANSIT' | 'CUSTOMS_CLEARED' | 'RELEASED' | 'REFUNDED';

export interface GlobalTradeContract {
  contractId: string;
  importerWalletId: string;
  exporterWalletId: string;
  amountGTQ: number;
  hsCode: string;
  logisticsTrackingId: string;
  status: EscrowStatus;
  insuranceActive: boolean;
}

export interface EscrowActionResult {
  success: boolean;
  contract: GlobalTradeContract;
  message: string;
}

function required(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} is required`);
  return value.trim();
}

function copy(contract: GlobalTradeContract): GlobalTradeContract {
  return { ...contract };
}

export class VivoTrustEscrowEngine {
  public createLockedContract(importerWalletId: string, exporterWalletId: string, amountGTQ: number, hsCode: string): GlobalTradeContract {
    required(importerWalletId, 'importerWalletId');
    required(exporterWalletId, 'exporterWalletId');
    required(hsCode, 'hsCode');
    if (importerWalletId === exporterWalletId) throw new Error('importer and exporter wallets must differ');
    if (!Number.isFinite(amountGTQ) || amountGTQ <= 0) throw new Error('amountGTQ must be greater than zero');
    return { contractId: `VT-${randomUUID()}`, importerWalletId, exporterWalletId, amountGTQ: Number(amountGTQ.toFixed(2)), hsCode, logisticsTrackingId: '', status: 'FUNDS_LOCKED', insuranceActive: true };
  }

  public attachLogisticsData(contract: GlobalTradeContract, trackingId: string): GlobalTradeContract {
    required(trackingId, 'trackingId');
    if (contract.status !== 'FUNDS_LOCKED') throw new Error('logistics can only attach to a funds-locked contract');
    return { ...copy(contract), logisticsTrackingId: trackingId, status: 'IN_TRANSIT' };
  }

  public triggerAutomaticRelease(contract: GlobalTradeContract, logisticsStatus: string): EscrowActionResult {
    required(contract.contractId, 'contractId');
    required(logisticsStatus, 'logisticsStatus');
    if (!contract.logisticsTrackingId) return { success: false, contract: copy(contract), message: 'Verified logistics tracking is required before escrow resolution.' };
    if (contract.status === 'RELEASED' || contract.status === 'REFUNDED') return { success: false, contract: copy(contract), message: 'Escrow contract is already resolved.' };
    if (logisticsStatus === 'CUSTOMS_CLEARED' && contract.status === 'IN_TRANSIT') return { success: false, contract: { ...copy(contract), status: 'CUSTOMS_CLEARED' }, message: 'Customs cleared; delivery evidence is still required before fund release.' };
    if (logisticsStatus === 'DELIVERED' && (contract.status === 'IN_TRANSIT' || contract.status === 'CUSTOMS_CLEARED')) return { success: true, contract: { ...copy(contract), status: 'RELEASED' }, message: `Funds (${contract.amountGTQ} GTQ) released after verified delivery evidence.` };
    if (logisticsStatus === 'SHIPMENT_FAILED' && contract.insuranceActive && (contract.status === 'IN_TRANSIT' || contract.status === 'CUSTOMS_CLEARED')) return { success: true, contract: { ...copy(contract), status: 'REFUNDED' }, message: 'Shipment failed; insured refund workflow initiated for importer review.' };
    return { success: false, contract: copy(contract), message: 'Goods remain in transit. Funds remain securely locked.' };
  }
}