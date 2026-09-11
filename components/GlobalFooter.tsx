'use client';

import Link from 'next/link';
import { useSiteConfig } from './siteConfig';

export function GlobalFooter() {
  const { config } = useSiteConfig();
  return <footer className="border-t border-white/10 bg-[#07090D] px-4 py-8 text-white sm:px-6"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"><p className="text-xs text-white/55">{config.footerText}</p><nav className="flex gap-4 text-xs font-bold text-white/70" aria-label="Footer navigation"><Link href="/">Marketplace</Link><Link href="/cart">Preview cart</Link><Link href="/business">Sell with VIVO</Link></nav></div></footer>;
}
