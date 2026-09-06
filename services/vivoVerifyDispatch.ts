import type { VehicleVerificationInput } from './invisibleVehicleFilter';

export interface VivoVerifyDispatchRequest {
  listingId: string;
  vehicle: Pick<VehicleVerificationInput, 'vinNumber' | 'licensePlate'>;
}

export interface VivoVerifyDispatchResult {
  dispatchId: string;
  status: 'DISPATCH_REQUESTED';
}

export async function dispatchVivoVerifyMobileInspector(request: VivoVerifyDispatchRequest): Promise<VivoVerifyDispatchResult> {
  if (!request.listingId.trim() || !request.vehicle.vinNumber.trim() || !request.vehicle.licensePlate.trim()) {
    throw new Error('listingId, VIN, and license plate are required for inspector dispatch');
  }

  return {
    dispatchId: `VIVO-INSPECT-${Date.now()}`,
    status: 'DISPATCH_REQUESTED'
  };
}