// VIVO POS service worker.
//
// Scope: only the /pos app shell and Next's static assets — the rest of the
// marketplace site is left completely alone (no offline behavior needed or
// wanted there). Registered by components/PosAppShell.tsx.
//
// Strategy: stale-while-revalidate. Serve from cache immediately if we have
// it (instant load, works offline), and refresh the cache in the background
// from the network when there is one. Server actions (POST requests, e.g.
// recordPosSale) are never intercepted — those either succeed live or the
// caller (components/PosRegister.tsx) catches the failure and queues the
// sale in localStorage to retry later. This worker's job is purely "the app
// shell itself still opens with no connection," not syncing data.

const CACHE_NAME = 'vivo-pos-v1';
const APP_SHELL = ['/pos', '/pos/sell', '/pos/catalog', '/pos/sales', '/manifest.json', '/icons/pos-icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {
        // A first-visit install with no network yet — nothing to precache,
        // the fetch handler below will populate the cache as pages load.
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never touch non-GET requests — that's every server action call
  // (recordPosSale, createPosCatalogItem, sendPosReceiptSms, form posts).
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/pos') && !url.pathname.startsWith('/_next/static') && !url.pathname.startsWith('/icons')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
