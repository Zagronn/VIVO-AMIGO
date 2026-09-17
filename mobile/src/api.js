const { getApp } = require('./apps');

function createApiClient(appKey, { fetchImpl = globalThis.fetch, baseUrl } = {}) {
  const app = getApp(appKey);
  const origin = baseUrl || app.apiOrigin;
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  return {
    async request(path, options = {}) {
      const response = await fetchImpl(`${origin}${path}`, {
        ...options,
        headers: { 'content-type': 'application/json', ...(options.headers || {}) }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `${app.name} request failed`);
      return data;
    }
  };
}

module.exports = { createApiClient };
