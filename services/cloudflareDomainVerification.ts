export interface DomainConfig {
  domainName: string;
  targetProvider: 'VERCEL' | 'AWS_CLOUDFRONT';
  proxied: boolean;
  sslMode: 'FULL_STRICT';
}

export interface CloudflareDnsRecord {
  type: 'A' | 'CNAME';
  name: string;
  content: string;
  proxied: boolean;
  status: 'ACTIVE' | 'PENDING' | 'BLOCKED';
}

export interface DomainVerificationResult {
  success: boolean;
  domain: string;
  dnsRecord?: CloudflareDnsRecord;
  sslStatus: 'ENFORCED_FULL_STRICT' | 'PENDING_CONFIGURATION' | 'BLOCKED';
  message: string;
}

export interface CloudflareDomainAdapter {
  verifyDnsRecord: (config: DomainConfig, expectedRecord: CloudflareDnsRecord) => Promise<CloudflareDnsRecord>;
  verifySslMode: (config: DomainConfig) => Promise<'FULL_STRICT'>;
}

const TARGETS = {
  VERCEL: { type: 'A' as const, content: '76.76.21.21' },
  AWS_CLOUDFRONT: { type: 'CNAME' as const, content: 'vivoamigo.cloudfront.net' }
};

const unavailableAdapter: CloudflareDomainAdapter = {
  async verifyDnsRecord() {
    throw new Error('Cloudflare API adapter is not configured');
  },
  async verifySslMode() {
    throw new Error('Cloudflare API adapter is not configured');
  }
};

function validDomain(domainName: string): boolean {
  return /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(domainName);
}

export async function verifyCloudflareDomain(
  config: DomainConfig,
  adapter: CloudflareDomainAdapter = unavailableAdapter
): Promise<DomainVerificationResult> {
  if (!validDomain(config.domainName) || config.sslMode !== 'FULL_STRICT') {
    return { success: false, domain: config.domainName, sslStatus: 'BLOCKED', message: 'Domain configuration is invalid or does not enforce FULL_STRICT TLS.' };
  }

  const target = TARGETS[config.targetProvider];
  if (!target) return { success: false, domain: config.domainName, sslStatus: 'BLOCKED', message: 'Unsupported deployment provider.' };
  const expectedRecord: CloudflareDnsRecord = { ...target, name: config.domainName, proxied: config.proxied, status: 'ACTIVE' };

  try {
    const dnsRecord = await adapter.verifyDnsRecord(config, expectedRecord);
    const sslMode = await adapter.verifySslMode(config);
    const dnsMatches = dnsRecord.type === expectedRecord.type && dnsRecord.name === expectedRecord.name && dnsRecord.content === expectedRecord.content && dnsRecord.proxied === expectedRecord.proxied && dnsRecord.status === 'ACTIVE';
    if (!dnsMatches || sslMode !== 'FULL_STRICT') return { success: false, domain: config.domainName, dnsRecord, sslStatus: 'PENDING_CONFIGURATION', message: `Domain ${config.domainName} requires DNS or TLS reconciliation before activation.` };
    return { success: true, domain: config.domainName, dnsRecord, sslStatus: 'ENFORCED_FULL_STRICT', message: `Domain ${config.domainName} is routed through the verified Cloudflare edge.` };
  } catch {
    return { success: false, domain: config.domainName, sslStatus: 'PENDING_CONFIGURATION', message: `Domain ${config.domainName} is pending Cloudflare API verification.` };
  }
}