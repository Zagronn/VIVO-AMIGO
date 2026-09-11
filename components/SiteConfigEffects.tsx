'use client';

import { useEffect } from 'react';
import { useSiteConfig } from './siteConfig';

export function SiteConfigEffects() {
  const { config } = useSiteConfig();
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-orange', config.accent);
    root.style.setProperty('--vivo-panel', `rgba(255, 255, 255, ${config.glassOpacity})`);
    root.style.setProperty('--vivo-panel-strong', `rgba(255, 255, 255, ${Math.min(config.glassOpacity + 0.035, 0.2)})`);
    root.style.setProperty('--vivo-motion-ms', `${config.motionSpeed}ms`);
  }, [config]);
  return null;
}
