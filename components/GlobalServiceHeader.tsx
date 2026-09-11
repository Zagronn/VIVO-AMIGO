'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { VivoBrandLogo } from './VivoBrandLogo';
import { useSiteConfig } from './siteConfig';

export function GlobalServiceHeader() {
  const pathname = usePathname();
  const { config } = useSiteConfig();
  if (pathname === '/') return null;
  return <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090D]/90 px-4 py-3 text-white shadow-lg backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center gap-3"><VivoBrandLogo light /><div className="ml-auto flex items-center gap-1" aria-label="Browser navigation"><button type="button" aria-label="Geri" title="Geri" onClick={() => window.history.back()} className="rounded-lg border border-white/10 p-2 text-white/70 hover:border-[#FF6A00] hover:text-white"><ArrowLeft size={15} /></button><button type="button" aria-label="İleri" title="İleri" onClick={() => window.history.forward()} className="rounded-lg border border-white/10 p-2 text-white/70 hover:border-[#FF6A00] hover:text-white"><ArrowRight size={15} /></button><button type="button" aria-label="Yenile" title="Yenile" onClick={() => window.location.reload()} className="rounded-lg border border-white/10 p-2 text-white/70 hover:border-[#FF6A00] hover:text-white"><RotateCw size={15} /></button></div><nav className="flex items-center gap-2 overflow-x-auto" aria-label="VIVO AMIGO ecosystem"><Link href="https://payvivoamigo.com" className="whitespace-nowrap rounded-lg border border-white/10 px-3 py-2 text-[11px] font-bold tracking-[0.1em] text-white/70 hover:border-[#FF6A00] hover:text-[#FF6A00]">{config.navigation.pay}</Link><Link href="https://cargovivo.com" className="whitespace-nowrap rounded-lg border border-white/10 px-3 py-2 text-[11px] font-bold tracking-[0.1em] text-white/70 hover:border-[#2563EB] hover:text-blue-300">{config.navigation.cargo}</Link><Link href="https://vivoamigo.com/seller/dashboard" className="whitespace-nowrap rounded-lg border border-white/10 px-3 py-2 text-[11px] font-bold text-white/70 hover:border-[#7C3AED] hover:text-violet-300">{config.navigation.seller}</Link></nav></div></header>;
}
