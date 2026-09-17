export type CommunityFeatureCategory = 'BARTER_SYSTEM' | 'BULK_BUYING' | 'MICRO_JOBS' | 'DEVICE_EXCHANGE';
export type DevinFeatureStatus = 'ANALYZING' | 'CODING_IN_SANDBOX' | 'TESTING' | 'DEPLOYED_LIVE';

export interface CommunityFeatureRequest {
  requestId: string;
  authorName: string;
  title: string;
  description: string;
  category: CommunityFeatureCategory;
  upvotesCount: number;
  devinStatus: DevinFeatureStatus;
  progressPercentage: number;
  devinNotes?: string;
}

export function processUpvote(request: CommunityFeatureRequest): CommunityFeatureRequest {
  if (!request.requestId.trim() || !request.title.trim()) throw new Error('requestId and title are required');
  if (!Number.isInteger(request.upvotesCount) || request.upvotesCount < 0) throw new Error('upvotesCount must be a non-negative integer');

  const updatedVotes = request.upvotesCount + 1;
  let newStatus = request.devinStatus;
  let progress = request.progressPercentage;
  let notes = request.devinNotes;

  if (updatedVotes >= 1000 && request.devinStatus === 'ANALYZING') {
    newStatus = 'CODING_IN_SANDBOX';
    progress = 30;
    notes = 'Devin AI: Request hit 1000+ upvotes. Validating architecture and generating sandbox code...';
  }

  return { ...request, upvotesCount: updatedVotes, devinStatus: newStatus, progressPercentage: progress, devinNotes: notes };
}
