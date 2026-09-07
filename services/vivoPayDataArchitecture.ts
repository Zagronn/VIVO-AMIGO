import { randomUUID } from 'node:crypto';

export type MigrationPartner = 'BANCO_INDUSTRIAL' | 'BANRURAL' | 'TIGO' | 'CLARO';
export type MigrationEventType = 'INVITED' | 'CONSENTED' | 'MIGRATED' | 'REWARDED' | 'OPTED_OUT';

export interface MigrationConsent {
  userId: string;
  partner: MigrationPartner;
  consentVersion: string;
  acceptedAt: string;
  purposes: string[];
}

export interface VivoPayMigrationEvent {
  eventId: string;
  userId: string;
  partner: MigrationPartner;
  type: MigrationEventType;
  campaignId: string;
  consentVersion: string;
  occurredAt: string;
  metadata: Record<string, string>;
}

export interface SponsorAggregate {
  campaignId: string;
  partner: MigrationPartner;
  consentedUsers: number;
  migratedUsers: number;
  completedTransactions: number;
  optOuts: number;
}

export function createMigrationEvent(input: Omit<VivoPayMigrationEvent, 'eventId' | 'occurredAt'>): VivoPayMigrationEvent {
  if (!input.userId.trim() || !input.campaignId.trim() || !input.consentVersion.trim()) throw new Error('migration event identity and consent are required');
  return { ...input, eventId: `MIG-${randomUUID()}`, occurredAt: new Date().toISOString() };
}

export function validateMigrationConsent(consent: MigrationConsent): boolean {
  return Boolean(consent.userId.trim() && consent.partner && consent.consentVersion.trim() && consent.purposes.length > 0 && Number.isFinite(new Date(consent.acceptedAt).getTime()));
}

export function aggregateSponsorMetrics(events: VivoPayMigrationEvent[]): SponsorAggregate[] {
  const aggregates = new Map<string, SponsorAggregate>();
  for (const event of events) {
    const key = `${event.campaignId}:${event.partner}`;
    const aggregate = aggregates.get(key) || { campaignId: event.campaignId, partner: event.partner, consentedUsers: 0, migratedUsers: 0, completedTransactions: 0, optOuts: 0 };
    if (event.type === 'CONSENTED') aggregate.consentedUsers += 1;
    if (event.type === 'MIGRATED') aggregate.migratedUsers += 1;
    if (event.type === 'REWARDED') aggregate.completedTransactions += 1;
    if (event.type === 'OPTED_OUT') aggregate.optOuts += 1;
    aggregates.set(key, aggregate);
  }
  return [...aggregates.values()];
}