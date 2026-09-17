export const JOB_LISTING_DURATION_DAYS = 15;

export type JobListingStatus = 'ACTIVE' | 'EXPIRED' | 'ARCHIVED' | 'FILLED' | 'CANCELLED';

export interface JobListingPolicyInput {
  status: JobListingStatus;
  expiresAt: string;
  corporateApproved: boolean;
  hiringCommitmentSigned: boolean;
}

export interface JobListingPolicyResult {
  canPublish: boolean;
  shouldExpire: boolean;
  statusMessage: string;
}

export function evaluateJobListingPolicy(input: JobListingPolicyInput, now = new Date()): JobListingPolicyResult {
  if (!input.corporateApproved) return { canPublish: false, shouldExpire: false, statusMessage: 'Solo empresas verificadas pueden publicar ofertas de trabajo.' };
  if (!input.hiringCommitmentSigned) return { canPublish: false, shouldExpire: false, statusMessage: 'El compromiso de contratación debe estar firmado antes de publicar.' };
  if (input.status !== 'ACTIVE') return { canPublish: false, shouldExpire: false, statusMessage: 'La oferta no está activa.' };

  const shouldExpire = new Date(input.expiresAt).getTime() <= now.getTime();
  return shouldExpire
    ? { canPublish: false, shouldExpire: true, statusMessage: 'La oferta ha vencido después de 15 días y debe archivarse o renovarse.' }
    : { canPublish: true, shouldExpire: false, statusMessage: 'Oferta activa y verificada.' };
}
