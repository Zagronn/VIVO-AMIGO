import { verifyCloudflareDomain, type CloudflareDomainAdapter, type DomainConfig, type DomainVerificationResult } from './cloudflareDomainVerification';

export const CLOUDFLARE_DOMAIN_AGENT_ID = 105;

export interface CloudflareDomainSyncResult extends DomainVerificationResult {
  agentId: 105;
}

export async function syncCloudflareDomain(
  config: DomainConfig,
  adapter?: CloudflareDomainAdapter
): Promise<CloudflareDomainSyncResult> {
  const verification = await verifyCloudflareDomain(config, adapter);
  return { agentId: CLOUDFLARE_DOMAIN_AGENT_ID, ...verification };
}