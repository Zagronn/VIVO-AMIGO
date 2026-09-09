#!/usr/bin/env node

const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;
const apply = process.argv.includes('--apply');

if (!token || !zoneId) {
  console.error('CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID are required.');
  process.exitCode = 1;
} else {
  const endpoint = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
  const requiredRecords = [
    { type: 'A', name: '@', content: '76.76.21.21', ttl: 1, proxied: false },
    { type: 'CNAME', name: 'www', content: 'cname.vercel-dns.com', ttl: 1, proxied: false }
  ];

  async function cloudflare(path = '', options = {}) {
    const response = await fetch(`${endpoint}${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    const body = await response.json();
    if (!response.ok || body.success !== true) throw new Error(JSON.stringify(body.errors || body));
    return body.result;
  }

  async function main() {
    const existing = await cloudflare('?per_page=100');
    for (const desired of requiredRecords) {
      const match = existing.find((record) => record.type === desired.type && (record.name === desired.name || record.name === `${desired.name}.`));
      const action = match ? 'UPDATE' : 'CREATE';
      console.log(`${apply ? action : `DRY-RUN ${action}`}: ${desired.type} ${desired.name} -> ${desired.content} proxied=${desired.proxied}`);
      if (!apply) continue;
      const payload = { type: desired.type, name: desired.name, content: desired.content, ttl: desired.ttl, proxied: desired.proxied };
      await cloudflare(match ? `/${match.id}` : '', { method: match ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    }
    console.log(apply ? 'Cloudflare DNS changes applied.' : 'Dry run only. Re-run with --apply to change DNS.');
  }

  main().catch((error) => { console.error(`Cloudflare DNS sync failed: ${error.message}`); process.exitCode = 1; });
}