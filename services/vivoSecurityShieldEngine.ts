export type ThreatLevel = 'NORMAL' | 'ELEVATED_RISK' | 'CRITICAL_ATTACK';
export type VaultStatus = 'ENCRYPTED_SECURE' | 'ISOLATED';

export interface SystemSecurityStatus {
  isEmergencyLockActive: boolean;
  activeThreatLevel: ThreatLevel;
  totalBlockedAttempts: number;
  vaultStatus: VaultStatus;
}

export interface SecurityAlert {
  type: 'EMERGENCY_LOCK' | 'TRANSACTION_ANOMALY';
  triggeredBy?: string;
  amountGTQ?: number;
  baselineGTQ?: number;
  createdAt: string;
}

export interface TransactionRiskResult {
  isHighRisk: boolean;
  reason?: 'EXCEEDS_TEN_X_BASELINE' | 'EXCEEDS_HIGH_VALUE_THRESHOLD';
}

const TEN_X_MULTIPLIER = 10;
const HIGH_VALUE_THRESHOLD_GTQ = 50_000;

const initialStatus = (): SystemSecurityStatus => ({
  isEmergencyLockActive: false,
  activeThreatLevel: 'NORMAL',
  totalBlockedAttempts: 14,
  vaultStatus: 'ENCRYPTED_SECURE'
});

export class VivoSecurityShieldEngine {
  private status: SystemSecurityStatus;
  private readonly alerts: SecurityAlert[] = [];

  constructor(initial: Partial<SystemSecurityStatus> = {}) {
    this.status = { ...initialStatus(), ...initial };
  }

  getStatus(): SystemSecurityStatus {
    return { ...this.status };
  }

  getAlerts(): SecurityAlert[] {
    return [...this.alerts];
  }

  triggerEmergencyLock(triggeredBy: string): SystemSecurityStatus {
    if (!triggeredBy.trim()) throw new Error('triggeredBy is required');
    this.status = {
      ...this.status,
      isEmergencyLockActive: true,
      activeThreatLevel: 'CRITICAL_ATTACK',
      vaultStatus: 'ISOLATED'
    };
    this.alerts.push({ type: 'EMERGENCY_LOCK', triggeredBy, createdAt: new Date().toISOString() });
    return this.getStatus();
  }

  evaluateTransactionRisk(amountGTQ: number, userBaselineAvg: number): TransactionRiskResult {
    if (!Number.isFinite(amountGTQ) || amountGTQ <= 0 || !Number.isFinite(userBaselineAvg) || userBaselineAvg < 0) {
      throw new Error('transaction amount and baseline must be valid numbers');
    }
    const exceedsBaseline = amountGTQ > userBaselineAvg * TEN_X_MULTIPLIER;
    const exceedsHighValueThreshold = amountGTQ > HIGH_VALUE_THRESHOLD_GTQ;
    if (!exceedsBaseline && !exceedsHighValueThreshold) return { isHighRisk: false };

    this.status = {
      ...this.status,
      activeThreatLevel: this.status.isEmergencyLockActive ? 'CRITICAL_ATTACK' : 'ELEVATED_RISK',
      totalBlockedAttempts: this.status.totalBlockedAttempts + 1
    };
    this.alerts.push({ type: 'TRANSACTION_ANOMALY', amountGTQ, baselineGTQ: userBaselineAvg, createdAt: new Date().toISOString() });
    return { isHighRisk: true, reason: exceedsBaseline ? 'EXCEEDS_TEN_X_BASELINE' : 'EXCEEDS_HIGH_VALUE_THRESHOLD' };
  }
}

export const triggerEmergencyLock = (triggeredBy: string, engine = new VivoSecurityShieldEngine()) => engine.triggerEmergencyLock(triggeredBy);