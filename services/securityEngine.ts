import type { BlacklistEvaluation, InspectionReport, KYCUserData } from '../types/securityModule';

export function evaluateRiskAndBlacklist(
  ipAddress: string,
  deviceFingerprint: string,
  rapidActionCount: number,
  isVpnUsed: boolean
): BlacklistEvaluation {
  if (!ipAddress.trim() || !deviceFingerprint.trim()) throw new Error('IP address and device fingerprint are required');
  if (!Number.isFinite(rapidActionCount) || rapidActionCount < 0) throw new Error('rapidActionCount must be a non-negative number');

  let riskScore = 0;
  if (isVpnUsed) riskScore += 40;
  if (rapidActionCount > 20) riskScore += 50;
  const shouldBan = riskScore >= 70;

  return {
    ipAddress,
    deviceFingerprint,
    suspiciousActivityScore: riskScore,
    shouldBan,
    banReason: shouldBan ? 'Automated Ban: Suspicious behavior and high risk score' : undefined
  };
}

export function executeEscrowLock(amountGTQ: number, kycData: KYCUserData, inspectionReport?: InspectionReport): EscrowLockResult {
  if (!Number.isFinite(amountGTQ) || amountGTQ <= 0) throw new Error('amountGTQ must be greater than zero');
  if (kycData.verificationLevel !== 'KYC_VERIFIED') throw new Error('Escrow işlemi için KYC doğrulaması zorunludur.');
  if (inspectionReport && (inspectionReport.overallScore < 1 || inspectionReport.overallScore > 100)) throw new Error('inspection score must be between 1 and 100');

  return {
    escrowId: `ESCROW-${Date.now()}`,
    amountLockedGTQ: Number(amountGTQ.toFixed(2)),
    status: 'FUNDS_LOCKED_IN_ESCROW',
    hasInspectionPassed: inspectionReport ? inspectionReport.overallScore > 70 : true,
    qrVerificationCode: inspectionReport?.qrVerificationUrl,
    timestamp: new Date().toISOString()
  };
}

export interface EscrowLockResult {
  escrowId: string;
  amountLockedGTQ: number;
  status: 'FUNDS_LOCKED_IN_ESCROW';
  hasInspectionPassed: boolean;
  qrVerificationCode?: string;
  timestamp: string;
}
