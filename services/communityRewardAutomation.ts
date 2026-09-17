export interface CommunityResolutionEvent {
  eventId: string;
  source: 'VIVO_CRITIQUE' | 'VIVO_VOZ';
  status: 'DEPLOYED_LIVE' | 'SANDBOX' | 'REJECTED';
  userId: string;
  userName: string;
}

export interface RewardDatabase {
  query<T = unknown>(sql: string, values: unknown[]): Promise<{ rows: T[] }>;
}

export interface NotificationAdapters {
  push(userId: string, message: string): Promise<void>;
  email(userId: string, subject: string, message: string): Promise<void>;
}

export interface CommunityRewardAutomationResult {
  rewarded: boolean;
  changelogMessage?: string;
}

const REWARD_MESSAGE = (userName: string) => `Gracias ${userName}. Devin AI implementó tu aporte en producción. Recibiste tu badge VIVO_HERO, 1 doping gratis y 50% de descuento en comisión Escrow.`;

export async function rewardResolvedCommunityContribution(event: CommunityResolutionEvent, db: RewardDatabase, notifications: NotificationAdapters): Promise<CommunityRewardAutomationResult> {
  if (event.status !== 'DEPLOYED_LIVE') return { rewarded: false };
  if (!event.eventId.trim() || !event.userId.trim() || !event.userName.trim()) throw new Error('resolution event identity is required');

  const existing = await db.query<{ id: string }>('SELECT id FROM community_reward_events WHERE event_id = $1', [event.eventId]);
  if (existing.rows.length > 0) return { rewarded: false };

  await db.query('BEGIN', []);
  try {
    await db.query('INSERT INTO user_profile_badges (user_id, badge_code, source_event_id) VALUES ($1, $2, $3) ON CONFLICT (user_id, badge_code) DO NOTHING', [event.userId, 'VIVO_HERO', event.eventId]);
    await db.query('INSERT INTO wallet_rewards (user_id, reward_type, quantity, source_event_id) VALUES ($1, $2, $3, $4), ($1, $5, $6, $4)', [event.userId, 'LISTING_DOPING_CREDIT', 1, event.eventId, 'ESCROW_COMMISSION_DISCOUNT_50', 1]);
    const changelogMessage = `Feature/Fix implemented thanks to community Hero ${event.userName}!`;
    await db.query('INSERT INTO public_changelog (source_event_id, message, author_user_id) VALUES ($1, $2, $3)', [event.eventId, changelogMessage, event.userId]);
    await db.query('INSERT INTO community_reward_events (event_id, user_id, source, status) VALUES ($1, $2, $3, $4)', [event.eventId, event.userId, event.source, event.status]);
    await db.query('COMMIT', []);

    const message = REWARD_MESSAGE(event.userName);
    await Promise.all([
      notifications.push(event.userId, message),
      notifications.email(event.userId, 'VIVO AMIGO Hero reward', message)
    ]);
    return { rewarded: true, changelogMessage };
  } catch (error) {
    await db.query('ROLLBACK', []);
    throw error;
  }
}
