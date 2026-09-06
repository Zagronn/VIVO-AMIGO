export type CritiqueCategory = 'TECHNICAL_BUG' | 'DESIGN_UX' | 'BUSINESS_LOGIC' | 'PRICING';
export type SentimentScore = 'URGENT_ANGRY' | 'CONSTRUCTIVE' | 'NEUTRAL';
export type RootCauseType = 'CODE_DEFECT' | 'API_GATEWAY_TIMEOUT' | 'STRATEGIC_DECISION';
export type DevinActionStatus = 'ANALYZING' | 'AUTO_FIXING_HOTFIX' | 'DEPLOYED_TO_LIVE' | 'NEEDS_CARLOS_APPROVAL';

export interface CritiqueSubmission {
  critiqueId: string;
  userId: string;
  category: CritiqueCategory;
  rating: number;
  userComment: string;
  sentimentScore: SentimentScore;
  rootCauseType: RootCauseType;
  devinActionStatus: DevinActionStatus;
}

export function processUserCritique(submission: CritiqueSubmission): CritiqueSubmission {
  if (!submission.critiqueId.trim() || !submission.userId.trim()) throw new Error('critiqueId and userId are required');
  if (!Number.isInteger(submission.rating) || submission.rating < 1 || submission.rating > 5) throw new Error('rating must be an integer between 1 and 5');
  if (!submission.userComment.trim()) throw new Error('userComment is required');

  let actionStatus = submission.devinActionStatus;
  if (submission.rootCauseType === 'CODE_DEFECT' || submission.category === 'DESIGN_UX') actionStatus = 'AUTO_FIXING_HOTFIX';
  else if (submission.rootCauseType === 'STRATEGIC_DECISION' || submission.category === 'PRICING') actionStatus = 'NEEDS_CARLOS_APPROVAL';

  return { ...submission, devinActionStatus: actionStatus };
}
