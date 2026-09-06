import { createHash } from 'node:crypto';

export interface SocialVerifyPayload {
  userId: string;
  platform: 'WHATSAPP_STATUS' | 'FACEBOOK_POST' | 'INSTAGRAM_STORY' | 'TIKTOK';
  sharedLinkOrScreenshotUrl: string;
}

export interface VerificationResponse {
  success: boolean;
  commissionRate: number;
  freeDopingCreditsGranted: number;
  message: string;
}

export interface SocialShareEvidence {
  isPublic: boolean;
  containsRequiredHashtag: boolean;
  containsOfficialPromoVideo: boolean;
}

export interface SocialShareVerificationAdapters {
  verifyShare: (payload: SocialVerifyPayload) => Promise<SocialShareEvidence>;
}

export interface SocialShareClaimStore {
  hasClaimed: (userId: string) => Promise<boolean>;
  recordClaim: (userId: string, payload: SocialVerifyPayload) => Promise<void>;
}

export interface SocialPromotionDatabase {
  query<T = { id: string }>(sql: string, values: unknown[]): Promise<{ rows: T[] }>;
}

const STANDARD_COMMISSION_RATE = 0.035;
const unavailableAdapters: SocialShareVerificationAdapters = {
  async verifyShare() {
    throw new Error('social platform verification adapter is not configured');
  }
};

const inMemoryClaims = new Set<string>();
const defaultClaimStore: SocialShareClaimStore = {
  async hasClaimed(userId) {
    return inMemoryClaims.has(userId);
  },
  async recordClaim(userId) {
    inMemoryClaims.add(userId);
  }
};

const unavailablePromotionDatabase: SocialPromotionDatabase = {
  async query() {
    throw new Error('promotion database adapter is not configured');
  }
};

function validPayload(payload: SocialVerifyPayload): boolean {
  return typeof payload.userId === 'string'
    && payload.userId.trim() !== ''
    && ['WHATSAPP_STATUS', 'FACEBOOK_POST', 'INSTAGRAM_STORY', 'TIKTOK'].includes(payload.platform)
    && typeof payload.sharedLinkOrScreenshotUrl === 'string'
    && /^https:\/\//i.test(payload.sharedLinkOrScreenshotUrl.trim());
}

function promotionEventId(payload: SocialVerifyPayload): string {
  const digest = createHash('sha256').update(`${payload.userId}:${payload.platform}:${payload.sharedLinkOrScreenshotUrl}`).digest('hex').slice(0, 32);
  return `VIVO-VIRAL:${digest}`;
}

async function grantVerifiedPromotion(payload: SocialVerifyPayload, database: SocialPromotionDatabase): Promise<boolean> {
  const eventId = promotionEventId(payload);
  await database.query('BEGIN', []);
  try {
    const existing = await database.query<{ id: string }>('SELECT id FROM wallet_rewards WHERE user_id = $1 AND reward_type = $2 AND source_event_id = $3 FOR UPDATE', [payload.userId, 'LISTING_DOPING_CREDIT', eventId]);
    if (existing.rows.length > 0) {
      await database.query('COMMIT', []);
      return false;
    }
    const user = await database.query<{ id: string }>('UPDATE users SET commission_rate = 0.0, doping_credits = doping_credits + 1 WHERE id = $1 RETURNING id', [payload.userId]);
    if (user.rows.length === 0) throw new Error('promotion user not found');
    await database.query('INSERT INTO wallet_rewards (user_id, reward_type, quantity, source_event_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, reward_type, source_event_id) DO NOTHING', [payload.userId, 'LISTING_DOPING_CREDIT', 1, eventId]);
    await database.query('COMMIT', []);
    return true;
  } catch (error) {
    await database.query('ROLLBACK', []);
    throw error;
  }
}

export async function processSocialShareVerification(
  payload: SocialVerifyPayload,
  adapters: SocialShareVerificationAdapters = unavailableAdapters,
  claimStore: SocialShareClaimStore = defaultClaimStore,
  database: SocialPromotionDatabase = unavailablePromotionDatabase
): Promise<VerificationResponse> {
  if (!validPayload(payload)) {
    return {
      success: false,
      commissionRate: STANDARD_COMMISSION_RATE,
      freeDopingCreditsGranted: 0,
      message: 'No pudimos verificar el enlace. Por favor asegúrate de que la publicación sea pública e incluya el video oficial.'
    };
  }

  try {
    if (await claimStore.hasClaimed(payload.userId)) {
      return { success: false, commissionRate: STANDARD_COMMISSION_RATE, freeDopingCreditsGranted: 0, message: 'Esta promoción ya fue utilizada en tu cuenta.' };
    }
    const evidence = await adapters.verifyShare(payload);
    const isSharedValid = evidence.isPublic && evidence.containsRequiredHashtag && evidence.containsOfficialPromoVideo;
    if (!isSharedValid) {
      return { success: false, commissionRate: STANDARD_COMMISSION_RATE, freeDopingCreditsGranted: 0, message: 'No pudimos verificar el enlace. Por favor asegúrate de que la publicación sea pública e incluya el video oficial.' };
    }
    const rewardGranted = await grantVerifiedPromotion(payload, database);
    if (!rewardGranted) return { success: false, commissionRate: STANDARD_COMMISSION_RATE, freeDopingCreditsGranted: 0, message: 'Esta promoción ya fue utilizada en tu cuenta.' };
    await claimStore.recordClaim(payload.userId, payload);
    return {
      success: true,
      commissionRate: 0,
      freeDopingCreditsGranted: 1,
      message: '¡Felicidades! Tu publicación ha sido verificada. Tu comisión para la primera transacción se actualizó a 0%.'
    };
  } catch {
    return { success: false, commissionRate: STANDARD_COMMISSION_RATE, freeDopingCreditsGranted: 0, message: 'No pudimos verificar el enlace. Por favor inténtalo de nuevo más tarde.' };
  }
}