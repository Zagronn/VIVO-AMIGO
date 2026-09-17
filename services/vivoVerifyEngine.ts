import type { FieldInspectionReport } from './fieldInspection';
import { processInvisibleVehicleFilter as runInvisibleVehicleFilter } from './invisibleVehicleFilter';
import { dispatchVivoVerifyMobileInspector } from './vivoVerifyDispatch';
import type { VehicleVerificationAdapters, VehicleVerificationInput, VerificationResult } from './invisibleVehicleFilter';

export type { VehicleVerificationAdapters, VehicleVerificationInput, VerificationResult } from './invisibleVehicleFilter';

export type VivoVerifySealStatus = 'APPROVED_SEALED' | 'REJECTED';

export interface MotorizedInspectionInput {
  listingId: string;
  inspectorId: string;
  vehiclePaintThicknessOk: boolean;
  obdDiagnosticsPassed: boolean;
  thermalLeakCheckPassed?: boolean;
  tamperProofQrIssued: boolean;
}

export interface VivoVerifyInspection extends FieldInspectionReport {
  qrVerificationUrl: string;
  sealedAt: string;
}

export interface VipInspectionBookingInput {
  listingId: string;
  vinNumber: string;
  licensePlate: string;
  appointmentDate: string;
  inspectionTier: 'VIP_MOBILE_INSPECTION';
}

export interface VipInspectionBooking {
  bookingId: string;
  listingId: string;
  appointmentDate: string;
  inspectionTier: 'VIP_MOBILE_INSPECTION';
  dispatchId: string;
  status: 'DISPATCH_REQUESTED';
}

export async function processInvisibleVehicleFilter(
  input: VehicleVerificationInput,
  adapters?: VehicleVerificationAdapters
): Promise<VerificationResult> {
  return runInvisibleVehicleFilter(input, adapters);
}

export async function bookVipInspection(input: VipInspectionBookingInput): Promise<VipInspectionBooking> {
  if (!input.listingId.trim() || !input.vinNumber.trim() || !input.licensePlate.trim()) throw new Error('listingId, VIN, and license plate are required');
  if (input.inspectionTier !== 'VIP_MOBILE_INSPECTION') throw new Error('VIP mobile inspection is required');
  const appointmentDate = new Date(input.appointmentDate);
  if (Number.isNaN(appointmentDate.getTime()) || appointmentDate.getTime() <= Date.now()) throw new Error('appointmentDate must be a future date');
  const dispatch = await dispatchVivoVerifyMobileInspector({ listingId: input.listingId, vehicle: { vinNumber: input.vinNumber, licensePlate: input.licensePlate } });
  return {
    bookingId: `VIP-BOOKING-${Date.now()}`,
    listingId: input.listingId,
    appointmentDate: appointmentDate.toISOString(),
    inspectionTier: input.inspectionTier,
    dispatchId: dispatch.dispatchId,
    status: dispatch.status
  };
}

export function issueMotorizedVivoVerifySeal(input: MotorizedInspectionInput): VivoVerifyInspection {
  if (!input.listingId.trim() || !input.inspectorId.trim()) throw new Error('listingId and inspectorId are required');
  const passed = input.vehiclePaintThicknessOk && input.obdDiagnosticsPassed && input.tamperProofQrIssued === true;
  const inspectionId = `VERIFY-${Date.now()}`;
  const status: VivoVerifySealStatus = passed ? 'APPROVED_SEALED' : 'REJECTED';
  return {
    ...input,
    tamperProofQrIssued: true,
    inspectionId,
    status,
    qrVerificationUrl: `https://vivoamigo.com/verify/${inspectionId}`,
    sealedAt: new Date().toISOString()
  };
}
