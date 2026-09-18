'use client';

import { useEffect, useState } from 'react';

/**
 * Mounted once in app/pos/layout.tsx. Handles the two pieces of "make this
 * feel like a real app" that only work from the client:
 *
 *  1. Registers the service worker (public/sw.js) so the VIVO POS screens
 *     keep working — and a sale can still be logged — with no connection.
 *  2. Detects standalone/installed mode and hides the marketing Navbar and
 *     Footer (see the `body.pos-standalone` rule in globals.css), since a
 *     seller who installed this to their home screen is using a POS app,
 *     not browsing the marketing site.
 *
 * Renders nothing visible — it only ever manages a body class + the SW.
 */
export function PosAppShell() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('VIVO POS service worker registration failed:', err);
      });
    }

    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      // iOS Safari's own flag for "added to home screen".
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      document.body.classList.add('pos-standalone');
    }

    setOffline(!navigator.onLine);
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      document.body.classList.remove('pos-standalone');
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="sticky top-0 z-50 bg-vivo-black py-1.5 text-center text-xs font-semibold text-white">
      You're offline — sales are being saved on this device and will sync automatically.
    </div>
  );
}
