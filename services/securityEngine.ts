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
    banReason: shouldBan ? 'Blacklist AI: Şüpheli IP/Cihaz davranışı ve yüksek risk skoru' : undefined
  };
}

export function executeSmartEscrowLock(amountGTQ: number, kycData: KYCUserData, inspectionReport?: InspectionReport): EscrowLockResult {
  if (!Number.isFinite(amountGTQ) || amountGTQ <= 0) throw new Error('amountGTQ must be greater than zero');
  if (kycData.verificationLevel !== 'KYC_VERIFIED' && kycData.verificationLevel !== 'GOVERNMENT_ESCROW_APPROVED') throw new Error('Smart Escrow işlemi için KYC kimlik doğrulaması zorunludur.');
  if (inspectionReport && (inspectionReport.overallScore < 1 || inspectionReport.overallScore > 100)) throw new Error('inspection score must be between 1 and 100');

  return {
    escrowId: `ESCROW-GTQ-${Date.now()}`,
    amountLockedGTQ: Number(amountGTQ.toFixed(2)),
    status: 'FUNDS_LOCKED_IN_ESCROW',
    hasInspectionPassed: inspectionReport ? inspectionReport.overallScore >= 70 : true,
    qrVerificationCode: inspectionReport?.qrVerificationUrl,
    timestamp: new Date().toISOString()
  };
}

export const executeEscrowLock = executeSmartEscrowLock;

export interface EscrowLockResult {
  escrowId: string;
  amountLockedGTQ: number;
  status: 'FUNDS_LOCKED_IN_ESCROW';
  hasInspectionPassed: boolean;
  qrVerificationCode?: string;
  timestamp: string;
}
