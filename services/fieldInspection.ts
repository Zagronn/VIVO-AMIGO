export interface FieldInspectionReport {
  inspectionId: string;
  listingId: string;
  inspectorId: string;
  vehiclePaintThicknessOk: boolean;
  obdDiagnosticsPassed: boolean;
  thermalLeakCheckPassed?: boolean;
  tamperProofQrIssued: boolean;
  status: 'APPROVED_SEALED' | 'REJECTED';
}

export function issueVivoVerifySeal(report: Omit<FieldInspectionReport, 'inspectionId' | 'status'>): FieldInspectionReport {
  if (!report.listingId.trim() || !report.inspectorId.trim()) throw new Error('listingId and inspectorId are required');
  const isPassed = report.vehiclePaintThicknessOk && report.obdDiagnosticsPassed && report.tamperProofQrIssued;

  return {
    ...report,
    inspectionId: `VERIFY-${Date.now()}`,
    status: isPassed ? 'APPROVED_SEALED' : 'REJECTED'
  };
}
