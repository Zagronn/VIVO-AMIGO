import { processUserCritique, type CritiqueSubmission } from './critiqueEngine';

export interface CritiqueRoutingResult {
  submission: CritiqueSubmission;
  route: 'DEVIN_HOTFIX' | 'CARLOS_APPROVAL' | 'ANALYSIS_QUEUE';
  sentiment: CritiqueSubmission['sentimentScore'];
  hotfixEligible: boolean;
  actionNote: string;
}

function inferSentiment(comment: string): CritiqueSubmission['sentimentScore'] {
  const normalized = comment.toLowerCase();
  if (/urgent|critical|broken|fraud|emergency|crash|urgente|grave|fallo/.test(normalized)) return 'URGENT_ANGRY';
  if (/suggest|improve|please|recommend|suger|mejorar|propuesta/.test(normalized)) return 'CONSTRUCTIVE';
  return 'NEUTRAL';
}

export function routeCritiqueToDevin(submission: CritiqueSubmission): CritiqueRoutingResult {
  const normalized = { ...submission, sentimentScore: submission.sentimentScore || inferSentiment(submission.userComment) };
  const processed = processUserCritique(normalized);
  const hotfixEligible = processed.devinActionStatus === 'AUTO_FIXING_HOTFIX';
  const route = hotfixEligible ? 'DEVIN_HOTFIX' : processed.devinActionStatus === 'NEEDS_CARLOS_APPROVAL' ? 'CARLOS_APPROVAL' : 'ANALYSIS_QUEUE';
  return {
    submission: processed,
    route,
    sentiment: processed.sentimentScore,
    hotfixEligible,
    actionNote: hotfixEligible ? 'Devin hot-fix pipeline may prepare a sandbox patch; production release remains gated.' : route === 'CARLOS_APPROVAL' ? 'Strategic decision requires Carlos approval.' : 'Critique queued for analysis.'
  };
}
