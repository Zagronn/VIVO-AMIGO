export { verifyUserCardAndIdentity } from './cardVerification';
export type { CardVerificationRequest, SecurityEvaluationResult } from './cardVerification';

export const PCI_TOKENIZATION_POLICY = 'Raw card numbers are never accepted or stored; Visanet/NeoNet token adapters own 3DS authorization.';
