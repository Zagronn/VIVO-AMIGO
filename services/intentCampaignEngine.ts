export type IntentTrigger = 'PROPERTY_RENTAL_SEARCH' | 'CAR_EXPERT_COMPLETED' | 'CONSTRUCTION_MATERIAL_SEARCH';

export interface UserBehaviorProfile {
  userId: string;
  dpiName: string;
  phoneHash: string;
  recentSearchKeywords: string[];
  lastAction: IntentTrigger;
  zoneLocation: string;
  isCardVerified: boolean;
}

export interface TargetedCampaignTarget {
  userId: string;
  campaignChannel: 'WHATSAPP' | 'SMS';
  recommendedOffer: string;
  sponsorBrand: string;
}

export function analyzeUserIntentAndTriggerCampaign(user: UserBehaviorProfile): TargetedCampaignTarget | null {
  if (!user.userId.trim() || !user.phoneHash.trim() || !user.zoneLocation.trim()) return null;
  const keywords = user.recentSearchKeywords.map((keyword) => keyword.trim().toLowerCase());

  if (user.lastAction === 'CAR_EXPERT_COMPLETED') {
    return {
      userId: user.userId,
      campaignChannel: 'WHATSAPP',
      sponsorBrand: 'BYD Guatemala',
      recommendedOffer: `¡Felicidades por la venta de tu vehículo! Conoce los nuevos modelos eléctricos BYD con cuotas especiales para Zona ${user.zoneLocation}.`
    };
  }

  if (user.lastAction === 'PROPERTY_RENTAL_SEARCH' && keywords.includes('fletes')) {
    return {
      userId: user.userId,
      campaignChannel: 'SMS',
      sponsorBrand: 'CARGO VIVO & HomePartners',
      recommendedOffer: '¿Te mudas pronto? Obtén un 15% de descuento en fletes express y servicios de internet para tu nuevo hogar.'
    };
  }

  return null;
}
