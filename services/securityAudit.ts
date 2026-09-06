export interface SecurityAuditConfig {
  rawCardDataForbidden: boolean;
  tokenizationProvider: 'VISANET_NEONET';
  sqliXssScansRequired: boolean;
  deploymentGate: 'BLOCK_ON_FAILURE';
}

export const SECURITY_AUDIT_POLICY: SecurityAuditConfig = Object.freeze({
  rawCardDataForbidden: true,
  tokenizationProvider: 'VISANET_NEONET',
  sqliXssScansRequired: true,
  deploymentGate: 'BLOCK_ON_FAILURE'
});

export function assertDeploymentSecurityGate(scanPassed: boolean): void {
  if (!scanPassed) throw new Error('Deployment blocked: SQLi/XSS/security scan failed.');
}
