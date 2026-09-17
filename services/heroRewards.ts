export type HeroBadge = 'VIVO_HERO_GOLD' | 'VIVO_BUILDER' | 'BUG_HUNTER';
export type HeroRewardType = 'CRITIQUE_FIX' | 'VOZ_FEATURE';

export interface HeroReward {
  userId: string;
  userName: string;
  heroBadge: HeroBadge;
  freeDopingCredits: number;
  commissionDiscountPercentage: number;
  priorityVerifyAccess: boolean;
}

export function awardHeroUser(userId: string, userName: string, type: HeroRewardType): HeroReward {
  if (!userId.trim() || !userName.trim()) throw new Error('userId and userName are required');
  return {
    userId,
    userName,
    heroBadge: type === 'CRITIQUE_FIX' ? 'BUG_HUNTER' : 'VIVO_HERO_GOLD',
    freeDopingCredits: 1,
    commissionDiscountPercentage: 50,
    priorityVerifyAccess: true
  };
}
