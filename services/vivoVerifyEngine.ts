import type { FieldInspectionReport } from './fieldInspection';

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
