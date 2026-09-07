import { randomUUID } from 'node:crypto';

export type InsuranceCoverageType = 'RETAIL_MICRO' | 'AUTOMOTIVE_FULL' | 'LOGISTICS_ESCROW';

export interface InsurancePolicyQuote {
  policyId: string;
  partnerName: 'Seguros El Roble' | 'Seguros G&T' | 'Seguros Universales';
  coverageType: InsuranceCoverageType;
  insuredValueGTQ: number;
  premiumAmountGTQ: number;
  policyGuaranteeText: string;
}

export interface InsuranceQuoteAdapter {
  quote: (input: { coverageType: InsuranceCoverageType; insuredValueGTQ: number; premiumAmountGTQ: number }) => Promise<Pick<InsurancePolicyQuote, 'partnerName' | 'policyGuaranteeText'>>;
}

const unavailableAdapter: InsuranceQuoteAdapter = {
  async quote() {
    throw new Error('insurance partner adapter is not configured');
  }
};

const RATE_BY_COVERAGE: Record<InsuranceCoverageType, { rate: number; description: string }> = {
  RETAIL_MICRO: { rate: 0.015, description: 'Kargo teslimatı, hırsızlık ve fiziksel hasar için partner şartlarına tabi teminat.' },
  AUTOMOTIVE_FULL: { rate: 0.008, description: 'SAT devri, mekanik ekspertiz ve mülkiyet riskleri için partner şartlarına tabi teminat.' },
  LOGISTICS_ESCROW: { rate: 0.005, description: 'Uluslararası nakliye ve gümrük riskleri için partner şartlarına tabi teminat.' }
};

export class VivoInsureEngine {
  constructor(private readonly adapter: InsuranceQuoteAdapter = unavailableAdapter) {}

  public async calculateInstantQuote(coverageType: InsuranceCoverageType, itemValueGTQ: number): Promise<InsurancePolicyQuote> {
    if (!RATE_BY_COVERAGE[coverageType]) throw new Error('unsupported insurance coverage type');
    if (!Number.isFinite(itemValueGTQ) || itemValueGTQ <= 0) throw new Error('itemValueGTQ must be greater than zero');
    const policy = RATE_BY_COVERAGE[coverageType];
    const premiumAmountGTQ = Number(Math.max(itemValueGTQ * policy.rate, 5).toFixed(2));
    const partner = await this.adapter.quote({ coverageType, insuredValueGTQ: itemValueGTQ, premiumAmountGTQ });
    return { policyId: `POL-${coverageType}-${randomUUID()}`, partnerName: partner.partnerName, coverageType, insuredValueGTQ: Number(itemValueGTQ.toFixed(2)), premiumAmountGTQ, policyGuaranteeText: partner.policyGuaranteeText || policy.description };
  }
}