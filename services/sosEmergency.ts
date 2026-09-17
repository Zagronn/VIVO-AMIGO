export type SosIssueType = 'TOW_TRUCK' | 'FLAT_TIRE' | 'BATTERY_JUMP' | 'FUEL_DELIVERY';
export type HighwayRoute = 'INTERAMERICANA' | 'CARRETERA_EL_SALVADOR' | 'PACIFICO' | 'CITY_ZONE';

export interface SosEmergencyRequest {
  requestId: string;
  userId: string;
  issueType: SosIssueType;
  userLocation: { lat: number; lng: number };
  highwayRoute: HighwayRoute;
  status: 'DISPATCHING' | 'PROVIDER_ASSIGNED' | 'ON_THE_WAY' | 'COMPLETED';
  calculatedPriceGTQ: number;
  assignedProviderId?: string;
}

export function calculateFixedAssistPrice(issueType: SosIssueType, distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) throw new Error('distanceKm must be non-negative');
  const baseRates: Record<SosIssueType, number> = { TOW_TRUCK: 250, FLAT_TIRE: 100, BATTERY_JUMP: 80, FUEL_DELIVERY: 75 };
  const perKmRate = issueType === 'TOW_TRUCK' ? 12 : 5;
  return Math.round(baseRates[issueType] + distanceKm * perKmRate);
}

export function dispatchEmergencyAssist(userId: string, issueType: SosIssueType, userLocation: { lat: number; lng: number }, highwayRoute: HighwayRoute, distanceKm: number): SosEmergencyRequest {
  if (!userId.trim()) throw new Error('userId is required');
  if (!Number.isFinite(userLocation.lat) || !Number.isFinite(userLocation.lng)) throw new Error('userLocation must contain valid coordinates');
  return {
    requestId: `SOS-${Date.now()}`,
    userId,
    issueType,
    userLocation,
    highwayRoute,
    status: 'DISPATCHING',
    calculatedPriceGTQ: calculateFixedAssistPrice(issueType, distanceKm)
  };
}
