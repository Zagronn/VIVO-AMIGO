import { calculateViralIncentive, type ViralIncentiveDecision } from './viralIncentiveEngine';
import { VivoMercadoPlatformEngine, type MercadoDealRequest, type MercadoDealResult } from './vivoMercadoPlatformEngine';
import { createMigrationEvent, validateMigrationConsent, type MigrationConsent, type VivoPayMigrationEvent } from './vivoPayDataArchitecture';
import { VivoScoreBridge, type VivoScoreProvider, type VivoScoreRequest, type VivoScoreResponse } from './vivoScoreBridge';

export const VIVO_DOMAINS = {
  marketplace: 'vivoamigo.com',
  payments: 'payvivoamigo.com',
  logistics: 'cargovivo.com'
} as const;

export interface DvmValuationProvider {
  value: (input: { listingId: string; assetType: 'VEHICLE' | 'REAL_ESTATE' | 'ELECTRONICS'; askingPriceGTQ: number }) => Promise<{ minMarketValueGTQ: number; maxMarketValueGTQ: number; modelVersion: string }>;
}

export interface ProductionKernelAdapters {
  dvm: DvmValuationProvider;
  scoreProvider?: VivoScoreProvider;
}

export interface ListingTrustResult {
  domain: 'vivoamigo.com';
  listingId: string;
  isWithinPriceCorridor: boolean;
  minMarketValueGTQ: number;
  maxMarketValueGTQ: number;
  modelVersion: string;
  commission: ViralIncentiveDecision;
}

export class VivoAmigoProductionKernel {
  private readonly mercado: VivoMercadoPlatformEngine;
  private readonly score: VivoScoreBridge;

  constructor(private readonly adapters: ProductionKernelAdapters) {
    this.mercado = new VivoMercadoPlatformEngine({ scoreProvider: adapters.scoreProvider });
    this.score = new VivoScoreBridge(adapters.scoreProvider);
  }

  public async evaluateListing(input: { listingId: string; assetType: 'VEHICLE' | 'REAL_ESTATE' | 'ELECTRONICS'; askingPriceGTQ: number; userId: string; transactionId: string; campaignId: string; socialShareVerified: boolean; walletPaymentUsed: boolean }): Promise<ListingTrustResult> {
    if (!input.listingId.trim() || !Number.isFinite(input.askingPriceGTQ) || input.askingPriceGTQ <= 0) throw new Error('listingId and askingPriceGTQ are required');
    const valuation = await this.adapters.dvm.value({ listingId: input.listingId, assetType: input.assetType, askingPriceGTQ: input.askingPriceGTQ });
    if (valuation.minMarketValueGTQ <= 0 || valuation.maxMarketValueGTQ < valuation.minMarketValueGTQ) throw new Error('DVM returned an invalid market corridor');
    return {
      domain: VIVO_DOMAINS.marketplace,
      listingId: input.listingId,
      isWithinPriceCorridor: input.askingPriceGTQ >= valuation.minMarketValueGTQ && input.askingPriceGTQ <= valuation.maxMarketValueGTQ,
      minMarketValueGTQ: valuation.minMarketValueGTQ,
      maxMarketValueGTQ: valuation.maxMarketValueGTQ,
      modelVersion: valuation.modelVersion,
      commission: calculateViralIncentive({ ...input, grossAmountGTQ: input.askingPriceGTQ })
    };
  }

  public async lookupVivoScore(request: VivoScoreRequest): Promise<VivoScoreResponse> {
    return this.score.fetchUserScore(request);
  }

  public async initializeEscrow(request: MercadoDealRequest): Promise<MercadoDealResult> {
    return this.mercado.initializeDeal(request);
  }

  public recordMigration(consent: MigrationConsent, event: Omit<VivoPayMigrationEvent, 'eventId' | 'occurredAt'>): VivoPayMigrationEvent {
    if (!validateMigrationConsent(consent)) throw new Error('PRO-VIVO migration consent is invalid');
    if (consent.userId !== event.userId || consent.partner !== event.partner || consent.consentVersion !== event.consentVersion) throw new Error('migration event does not match consent');
    return createMigrationEvent(event);
  }
}