import { VivoMercadoEngine, type B2BImportExportDeal, type CrossBorderEscrowResult } from './vivoMercadoEngine';
import type { VivoScoreRequest, VivoScoreResponse, VivoScoreProvider } from './vivoScoreBridge';

export type MercadoCountry = 'GT' | 'MX' | 'CO' | 'PE' | 'CL' | 'BR';
export type MercadoCurrency = 'USD' | 'GTQ' | 'TRY' | 'CNY' | 'MXN' | 'COP' | 'PEN' | 'CLP' | 'BRL';

export interface MercadoCorridor {
  supplierCountry: 'TR' | 'CN';
  buyerCountry: MercadoCountry;
  settlementCurrencies: MercadoCurrency[];
  cargoDomain: 'cargovivo.com';
  paymentDomain: 'payvivoamigo.com';
}

export interface MercadoDealRequest {
  dealId: string;
  supplierCountry: 'TR' | 'CN';
  buyerCountry: MercadoCountry;
  settlementCurrency: MercadoCurrency;
  escrowAmountUSD: number;
  veriShieldApproved: boolean;
  securityLockActive: boolean;
}

export interface MercadoDealResult {
  dealId: string;
  status: 'ESCROW_INITIALIZED' | 'MANUAL_REVIEW';
  escrow?: CrossBorderEscrowResult;
  paymentDomain: 'payvivoamigo.com';
  cargoDomain: 'cargovivo.com';
  message: string;
}

export interface MercadoScoreLookup {
  lookup: (request: VivoScoreRequest) => Promise<VivoScoreResponse>;
}

export interface MercadoPlatformAdapters {
  scoreProvider?: VivoScoreProvider;
}

const LATAM_CURRENCIES: Record<MercadoCountry, MercadoCurrency[]> = {
  GT: ['USD', 'GTQ', 'TRY', 'CNY'],
  MX: ['USD', 'MXN', 'TRY', 'CNY'],
  CO: ['USD', 'COP', 'TRY', 'CNY'],
  PE: ['USD', 'PEN', 'TRY', 'CNY'],
  CL: ['USD', 'CLP', 'TRY', 'CNY'],
  BR: ['USD', 'BRL', 'TRY', 'CNY']
};

const unavailableScoreProvider: VivoScoreProvider = {
  async fetchScore() {
    throw new Error('VivoScore provider is not configured');
  }
};

export class VivoMercadoPlatformEngine {
  private readonly escrowEngine = new VivoMercadoEngine();
  private readonly scoreProvider: VivoScoreProvider;

  constructor(adapters: MercadoPlatformAdapters = {}) {
    this.scoreProvider = adapters.scoreProvider || unavailableScoreProvider;
  }

  public getCorridor(buyerCountry: MercadoCountry, supplierCountry: 'TR' | 'CN'): MercadoCorridor {
    return { supplierCountry, buyerCountry, settlementCurrencies: [...LATAM_CURRENCIES[buyerCountry]], cargoDomain: 'cargovivo.com', paymentDomain: 'payvivoamigo.com' };
  }

  public async initializeDeal(request: MercadoDealRequest): Promise<MercadoDealResult> {
    const corridor = this.getCorridor(request.buyerCountry, request.supplierCountry);
    if (!corridor.settlementCurrencies.includes(request.settlementCurrency)) return { dealId: request.dealId, status: 'MANUAL_REVIEW', paymentDomain: 'payvivoamigo.com', cargoDomain: 'cargovivo.com', message: 'Settlement currency is not enabled for this corridor.' };
    if (request.securityLockActive || !request.veriShieldApproved) return { dealId: request.dealId, status: 'MANUAL_REVIEW', paymentDomain: 'payvivoamigo.com', cargoDomain: 'cargovivo.com', message: 'VERI-SHIELD or Iron Shield review is required before escrow.' };
    const deal: B2BImportExportDeal = { dealId: request.dealId, supplierCountry: request.supplierCountry, buyerCountry: 'GT', escrowAmountUSD: request.escrowAmountUSD, currency: request.settlementCurrency as B2BImportExportDeal['currency'], veriShieldApproved: request.veriShieldApproved, status: 'PENDING_ESCROW' };
    try {
      const escrow = this.escrowEngine.initializeCrossBorderEscrow(deal);
      return { dealId: request.dealId, status: 'ESCROW_INITIALIZED', escrow, paymentDomain: 'payvivoamigo.com', cargoDomain: 'cargovivo.com', message: 'Escrow intent initialized; CARGO inspection remains required before release.' };
    } catch {
      return { dealId: request.dealId, status: 'MANUAL_REVIEW', paymentDomain: 'payvivoamigo.com', cargoDomain: 'cargovivo.com', message: 'Deal requires manual compliance review.' };
    }
  }

  public async fetchCreditScore(request: VivoScoreRequest): Promise<VivoScoreResponse> {
    if (!request.consentGiven) throw new Error('VERI-SHIELD consent is required before score lookup');
    return this.scoreProvider.fetchScore(request);
  }
}
