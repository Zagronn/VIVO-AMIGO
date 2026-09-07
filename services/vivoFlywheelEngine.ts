export type ProductCategory = 'VEHICLE' | 'ELECTRONICS' | 'REAL_ESTATE' | 'GENERAL';

export interface CrossSellRecommendation {
  serviceType: 'INSURANCE' | 'FINTECH_CREDIT' | 'SPARE_PARTS' | 'NOTARY_LEGAL';
  title: string;
  description: string;
  estimatedCostGTQ: number;
  actionUrl: string;
}

export interface VivoGoldTier {
  isGoldMember: boolean;
  escrowFeeDiscount: number;
  priorityListing: boolean;
  freeInsuranceCoverage: boolean;
}

function validPrice(itemPriceGTQ: number): void {
  if (!Number.isFinite(itemPriceGTQ) || itemPriceGTQ <= 0) throw new Error('itemPriceGTQ must be greater than zero');
}

export class VivoFlywheelEngine {
  public getGoldTier(isGoldMember: boolean): VivoGoldTier {
    return isGoldMember ? { isGoldMember: true, escrowFeeDiscount: 100, priorityListing: true, freeInsuranceCoverage: true } : { isGoldMember: false, escrowFeeDiscount: 0, priorityListing: false, freeInsuranceCoverage: false };
  }

  public generateCrossSellServices(category: ProductCategory, itemPriceGTQ: number): CrossSellRecommendation[] {
    validPrice(itemPriceGTQ);
    if (category === 'VEHICLE') return [
      { serviceType: 'INSURANCE', title: 'VIVO-INSURE araç poliçesi', description: 'Partner şartlarına tabi devir ve hasar teminatı seçeneklerini incele.', estimatedCostGTQ: Number((itemPriceGTQ * 0.008).toFixed(2)), actionUrl: '/insurance/vehicle-quote' },
      { serviceType: 'NOTARY_LEGAL', title: 'SAT & noter mülkiyet devri', description: 'VIVO-TRUST kanıtlarıyla noter ve plaka tescil akışını başlat.', estimatedCostGTQ: 450, actionUrl: '/legal/notary-service' },
      { serviceType: 'FINTECH_CREDIT', title: 'PAY VIVO kredi seçenekleri', description: 'Banco Industrial/Zigi uygunluk incelemesini başlat; onay partner kararına tabidir.', estimatedCostGTQ: 0, actionUrl: '/finance/bi/pre-approve' }
    ];
    if (category === 'ELECTRONICS') return [{ serviceType: 'INSURANCE', title: 'Ekran ve hırsızlık koruması', description: 'Partner poliçe şartlarına tabi mikro-kapsam seçeneklerini incele.', estimatedCostGTQ: Number(Math.max(itemPriceGTQ * 0.015, 15).toFixed(2)), actionUrl: '/insurance/micro-quote' }, { serviceType: 'SPARE_PARTS', title: 'Uyumlu aksesuar ve yedek parça', description: 'Ürün modeline göre uyumlu aksesuar seçeneklerini keşfet.', estimatedCostGTQ: 0, actionUrl: '/marketplace?category=ELECTRONICS' }];
    if (category === 'REAL_ESTATE') return [{ serviceType: 'FINTECH_CREDIT', title: 'PAY VIVO gayrimenkul finansmanı', description: 'Kredi uygunluk incelemesi ve koşullar için partner başvurusu.', estimatedCostGTQ: 0, actionUrl: '/finance/bi/pre-approve' }, { serviceType: 'NOTARY_LEGAL', title: 'Tapu ve hukuki inceleme', description: 'Registro de la Propiedad ve noter kanıtları için uzman incelemesi.', estimatedCostGTQ: 450, actionUrl: '/legal/notary-service' }];
    return [];
  }

  public canLeaveVerifiedReview(transactionCompleted: boolean, isEscrowReleased: boolean): { allowed: boolean; reason?: string } {
    if (transactionCompleted && isEscrowReleased) return { allowed: true };
    return { allowed: false, reason: 'Only transactions paid through PAY VIVO and confirmed through VIVO-TRUST can receive a verified review.' };
  }
}