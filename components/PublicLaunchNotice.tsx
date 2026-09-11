 'use client';

import { useSiteConfig } from './siteConfig';

export function PublicLaunchNotice() {
  const { config } = useSiteConfig();
  return <aside role="status" className="border-b border-[#FF6A00]/35 bg-[#21150D] px-4 py-3 text-center text-sm font-semibold text-[#FFE2CF]">
    <span className="text-[#FF6A00]">VIVO AMIGO</span> {config.announcement}
  </aside>;
}