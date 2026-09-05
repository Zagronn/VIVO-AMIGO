export type UserSector = 'CONSTRUCTION' | 'AGRICULTURE' | 'INDIVIDUAL' | 'RETAIL';
export type IntentCategory = 'SPARE_PARTS' | 'NEW_VEHICLE' | 'REAL_ESTATE' | 'WHOLESALE';

export interface UserTargetingProfile {
  userId: string;
  sector: UserSector;
  zone: string;
  searchIntentHistory: IntentCategory[];
  isB2BGoldSupplier?: boolean;
}

export interface AdCampaign {
  id: string;
  title: string;
  mediaType: 'RICH_MEDIA' | 'INTENT_BANNER' | 'LBS_SPONSORED';
  targetSectors: UserSector[];
  targetIntents: IntentCategory[];
  targetZones: string[];
  cpcPriceGTQ: number;
}

export function matchOptimalAd(profile: UserTargetingProfile, activeCampaigns: AdCampaign[]): AdCampaign | null {
  const eligible = activeCampaigns.filter((ad) => {
    const matchesSector = ad.targetSectors.includes(profile.sector);
    const matchesZone = ad.targetZones.length === 0 || ad.targetZones.includes(profile.zone);
    const matchesIntent = ad.targetIntents.some((intent) => profile.searchIntentHistory.includes(intent));
    const hasValidBid = Number.isFinite(ad.cpcPriceGTQ) && ad.cpcPriceGTQ >= 0;

    return hasValidBid && matchesSector && (matchesZone || matchesIntent);
  });

  return eligible.reduce<AdCampaign | null>((winner, campaign) => {
    if (!winner || campaign.cpcPriceGTQ > winner.cpcPriceGTQ) return campaign;
    return winner;
  }, null);
}
