export type VerificationLevel = 'BASIC_PHONE' | 'KYC_VERIFIED' | 'GOVERNMENT_ESCROW_APPROVED';

export interface KYCUserData {
  userId: string;
  nationalIdNumber: string;
  documentImageFrontUrl: string;
  documentImageBackUrl: string;
  utilityBillUrl: string;
  verificationLevel: VerificationLevel;
}

export interface InspectionReport {
  inspectionId: string;
  listingId: string;
  inspectorName: string;
  inspectionDate: string;
  qrVerificationUrl: string;
  reportPdfUrl: string;
  overallScore: number;
}

export interface BlacklistEvaluation {
  ipAddress: string;
  deviceFingerprint: string;
  suspiciousActivityScore: number;
  shouldBan: boolean;
  banReason?: string;
}
