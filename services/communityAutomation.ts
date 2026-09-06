import type { CommunityFeatureRequest, DevinFeatureStatus } from './communityFeatureEngine';

const BLOCKED_TERMS = ['exploit', 'malware', 'ransomware', 'terrorist', 'hack account'];
const SPAM_PATTERN = /(.)\1{7,}|https?:\/\/\S+\s+https?:\/\/\S+/i;

export interface CommunityModerationResult {
  isValid: boolean;
  reason?: string;
}

export interface SandboxAutomationPlan {
  branchName: string;
  requestId: string;
  steps: ['generate_full_stack_code', 'run_unit_tests', 'run_security_scan'];
  designStandards: ['VIVO_AMIGO', 'VIVO_CHECK_ESCROW', 'POSTGRESQL'];
  authorBadge: string;
}

export function moderateCommunityRequest(request: CommunityFeatureRequest): CommunityModerationResult {
  const content = `${request.title} ${request.description}`.toLowerCase();
  if (!request.requestId.trim() || !request.authorName.trim()) return { isValid: false, reason: 'missing identity fields' };
  if (SPAM_PATTERN.test(content)) return { isValid: false, reason: 'spam pattern detected' };
  if (BLOCKED_TERMS.some((term) => content.includes(term))) return { isValid: false, reason: 'offensive, illegal, or unsafe request' };
  return { isValid: true };
}

export function createSandboxAutomationPlan(request: CommunityFeatureRequest): SandboxAutomationPlan | null {
  const moderation = moderateCommunityRequest(request);
  if (!moderation.isValid || request.upvotesCount < 1000 || request.devinStatus !== 'CODING_IN_SANDBOX') return null;
  const safeRequestId = request.requestId.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return {
    branchName: `feature/vivo-voz-${safeRequestId}`,
    requestId: request.requestId,
    steps: ['generate_full_stack_code', 'run_unit_tests', 'run_security_scan'],
    designStandards: ['VIVO_AMIGO', 'VIVO_CHECK_ESCROW', 'POSTGRESQL'],
    authorBadge: `This feature was built based on ${request.authorName}'s suggestion.`
  };
}
