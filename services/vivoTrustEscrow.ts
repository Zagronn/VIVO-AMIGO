import { randomUUID } from 'node:crypto';

export type VivoTrustStatus = 'LOCKED_FUNDS' | 'IN_TRANSIT' | 'CUSTOMS_CLEARED' | 'DELIVERED_RELEASED' | 'INSURED_REFUND';
export type ShippingDocumentType = 'BILL_OF_LADING' | 'AIR_WAYBILL';

export interface VivoTrustEscrowContract {
  contractId: string;
  importerWalletId: string;
  exporterWalletId: string;
  amountGTQ: number;
  gtipHsCode: string;
  logisticsTrackingNumber: string;
  shippingDocumentType?: ShippingDocumentType;
  status: VivoTrustStatus;
  insuranceActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EscrowResolution {
  success: boolean;
  contract: VivoTrustEscrowContract;
  action: 'HOLD' | 'RELEASE_EXPORTER' | 'REFUND_IMPORTER';
  message: string;
}

function required(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} is required`);
  return value.trim();
}

export class VivoTrustEscrowService {
  public createLockedFunds(input: { importerWalletId: string; exporterWalletId: string; amountGTQ: number; gtipHsCode: string; insuranceActive?: boolean }): VivoTrustEscrowContract {
    required(input.importerWalletId, 'importerWalletId');
    required(input.exporterWalletId, 'exporterWalletId');
    required(input.gtipHsCode, 'gtipHsCode');
    if (input.importerWalletId === input.exporterWalletId) throw new Error('importer and exporter wallets must differ');
    if (!Number.isFinite(input.amountGTQ) || input.amountGTQ <= 0) throw new Error('amountGTQ must be greater than zero');
    const now = new Date().toISOString();
    return { contractId: `VVT-${randomUUID()}`, importerWalletId: input.importerWalletId, exporterWalletId: input.exporterWalletId, amountGTQ: Number(input.amountGTQ.toFixed(2)), gtipHsCode: input.gtipHsCode, logisticsTrackingNumber: '', status: 'LOCKED_FUNDS', insuranceActive: input.insuranceActive !== false, createdAt: now, updatedAt: now };
  }

  public attachShippingDocument(contract: VivoTrustEscrowContract, trackingNumber: string, documentType: ShippingDocumentType): VivoTrustEscrowContract {
    required(trackingNumber, 'trackingNumber');
    if (contract.status !== 'LOCKED_FUNDS') throw new Error('shipping data can only attach to locked funds');
    return { ...contract, logisticsTrackingNumber: trackingNumber, shippingDocumentType: documentType, status: 'IN_TRANSIT', updatedAt: new Date().toISOString() };
  }

  public resolveLogisticsSignal(contract: VivoTrustEscrowContract, signal: 'DELIVERED' | 'CUSTOMS_CLEARED' | 'SHIPMENT_FAILED'): EscrowResolution {
    if (!contract.logisticsTrackingNumber) throw new Error('logistics tracking number is required');
    if (contract.status === 'DELIVERED_RELEASED' || contract.status === 'INSURED_REFUND') return { success: false, contract, action: 'HOLD', message: 'VIVO-TRUST contract is already resolved.' };
    const updatedAt = new Date().toISOString();
    if (signal === 'CUSTOMS_CLEARED' && contract.status === 'IN_TRANSIT') return { success: false, contract: { ...contract, status: 'CUSTOMS_CLEARED', updatedAt }, action: 'HOLD', message: 'Customs cleared. Funds remain locked until delivery confirmation.' };
    if (signal === 'DELIVERED' && (contract.status === 'IN_TRANSIT' || contract.status === 'CUSTOMS_CLEARED')) return { success: true, contract: { ...contract, status: 'DELIVERED_RELEASED', updatedAt }, action: 'RELEASE_EXPORTER', message: 'Verified logistics delivery received. Funds released to exporter.' };
    if (signal === 'SHIPMENT_FAILED' && contract.insuranceActive && (contract.status === 'IN_TRANSIT' || contract.status === 'CUSTOMS_CLEARED')) return { success: true, contract: { ...contract, status: 'INSURED_REFUND', updatedAt }, action: 'REFUND_IMPORTER', message: 'Shipment failure received. VIVO-Sigorta refund workflow initiated for importer.' };
    return { success: false, contract: { ...contract, updatedAt }, action: 'HOLD', message: 'Funds remain locked pending a valid customs or delivery signal.' };
  }
}