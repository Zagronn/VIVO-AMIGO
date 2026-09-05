export type { BlacklistEvaluation, InspectionReport, KYCUserData, VerificationLevel } from './verification';

export interface EscrowLock {
	escrowId: string;
	amountLockedGTQ: number;
	status: 'FUNDS_LOCKED_IN_ESCROW' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';
	hasInspectionPassed: boolean;
	qrVerificationCode?: string;
	timestamp: string;
}
