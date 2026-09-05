export interface Env {
  LISTINGS_KV: KVNamespace;
  DB: D1Database;
  VECTOR_INDEX: VectorizeIndex;
}

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), { ...init, headers: { ...JSON_HEADERS, ...(init.headers || {}) } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...JSON_HEADERS, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });

    if (url.pathname === '/api/v1/whatsapp-click') {
      if (request.method !== 'POST') return json({ error: 'method not allowed' }, { status: 405, headers: { Allow: 'POST, OPTIONS' } });
      const listingId = url.searchParams.get('id');
      if (!listingId) return json({ error: 'id is required' }, { status: 400 });
      await env.DB.prepare('UPDATE listings SET whatsapp_click_count = whatsapp_click_count + 1 WHERE id = ?').bind(listingId).run();
      return json({ status: 'success' });
    }

    if (url.pathname === '/api/v1/listings' && request.method === 'GET') {
      const zone = url.searchParams.get('zone') || 'all';
      const category = url.searchParams.get('category');
      const cacheKey = `zone:${zone}:category:${category || 'all'}`;
      const cachedListings = await env.LISTINGS_KV.get(cacheKey);
      if (cachedListings) return new Response(cachedListings, { headers: { ...JSON_HEADERS, 'X-Cache': 'HIT-Cloudflare-Edge' } });

      const query = category
        ? 'SELECT id, title, price, zone, description, category FROM listings WHERE status = ? AND (? = ? OR zone = ?) AND category = ? ORDER BY created_at DESC LIMIT 100'
        : 'SELECT id, title, price, zone, description, category FROM listings WHERE status = ? AND (? = ? OR zone = ?) ORDER BY created_at DESC LIMIT 100';
      const bindings = category ? ['ACTIVE', zone, 'all', zone, category] : ['ACTIVE', zone, 'all', zone];
      const result = await env.DB.prepare(query).bind(...bindings).all();
      const payload = JSON.stringify(result.results || []);
      await env.LISTINGS_KV.put(cacheKey, payload, { expirationTtl: 60 });
      return new Response(payload, { headers: { ...JSON_HEADERS, 'X-Cache': 'MISS-Cloudflare-Edge' } });
    }

    if (url.pathname === '/health') return json({ service: 'vivo-amigo-edge', status: 'ok' });
    return new Response('VIVO AMIGO Cloudflare Edge Active', { status: 200, headers: JSON_HEADERS });
  }
};
