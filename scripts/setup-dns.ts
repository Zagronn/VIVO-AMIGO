interface DnsRecordConfig {
  type: 'A' | 'CNAME';
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

interface CloudflareRecord {
  id: string;
  type: string;
  name: string;
}

interface CloudflareResponse<T> {
  success: boolean;
  result: T;
  errors?: unknown;
}

const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;
const apply = process.argv.includes('--apply');
const endpoint = zoneId ? `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records` : '';
const requiredRecords: DnsRecordConfig[] = [
  { type: 'A', name: '@', content: '76.76.21.21', ttl: 1, proxied: false },
  { type: 'CNAME', name: 'www', content: 'cname.vercel-dns.com', ttl: 1, proxied: false }
];

if (!token || !zoneId) {
  console.error('CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID are required.');
  process.exitCode = 1;
} else {
  async function cloudflare<T>(path = '', options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${endpoint}${path}`, { ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) } });
    const body = await response.json() as CloudflareResponse<T>;
    if (!response.ok || !body.success) throw new Error(JSON.stringify(body.errors || body));
    return body.result;
  }

  async function setupDns() {
    const existing = await cloudflare<CloudflareRecord[]>('?per_page=100');
    for (const desired of requiredRecords) {
      const match = existing.find((record) => record.type === desired.type && (record.name === desired.name || record.name === `${desired.name}.`));
      console.log(`${apply ? match ? 'UPDATE' : 'CREATE' : `DRY-RUN ${match ? 'UPDATE' : 'CREATE'}`}: ${desired.type} ${desired.name} -> ${desired.content}`);
      if (!apply) continue;
      await cloudflare(match ? `/${match.id}` : '', { method: match ? 'PUT' : 'POST', body: JSON.stringify(desired) });
    }
    console.log(apply ? 'Cloudflare DNS changes applied.' : 'Dry run only. Re-run with --apply to change DNS.');
  }

  setupDns().catch((error: unknown) => { console.error(`Cloudflare DNS setup failed: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
}
