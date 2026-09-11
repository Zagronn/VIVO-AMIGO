'use client';

import { useEffect, useState } from 'react';

export type SiteConfig = {
  announcement: string;
  footerText: string;
  navigation: { pay: string; cargo: string; seller: string };
  accent: string;
  glassOpacity: number;
  motionSpeed: number;
  modules: { marketplacePreview: boolean; payPreview: boolean; cargoSimulation: boolean };
};

export const SITE_CONFIG_KEY = 'vivo-site-config';
export const defaultSiteConfig: SiteConfig = {
  announcement: 'VIVO AMIGO is coming soon. Listings are for preview only; purchases, payments, reservations, and applications are not yet available.',
  footerText: 'VIVO AMIGO public preview. All rights reserved.',
  navigation: { pay: 'PAY VIVO AMIGO', cargo: 'CARGO VIVO AMIGO', seller: 'Seller Panel' },
  accent: '#FF6A00',
  glassOpacity: 0.055,
  motionSpeed: 180,
  modules: { marketplacePreview: true, payPreview: true, cargoSimulation: true }
};

function readConfig() {
  if (typeof window === 'undefined') return defaultSiteConfig;
  try { return { ...defaultSiteConfig, ...JSON.parse(localStorage.getItem(SITE_CONFIG_KEY) || '{}') } as SiteConfig; } catch { return defaultSiteConfig; }
}

export function useSiteConfig() {
  const [config, setConfig] = useState(defaultSiteConfig);
  useEffect(() => {
    const sync = () => setConfig(readConfig());
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('vivo-site-config-updated', sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('vivo-site-config-updated', sync); };
  }, []);
  const updateConfig = (next: SiteConfig) => {
    localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(next));
    setConfig(next);
    window.dispatchEvent(new Event('vivo-site-config-updated'));
  };
  return { config, updateConfig };
}
