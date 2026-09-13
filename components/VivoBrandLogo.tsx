'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Home } from 'lucide-react';

export const BRAND_LOGO_STORAGE_KEY = 'vivo-amigo-brand-logo';
type BrandVariant = 'amigo' | 'pay' | 'cargo';

interface VivoBrandLogoProps {
  compact?: boolean;
  href?: string | null;
  light?: boolean;
  variant?: BrandVariant;
}

const brandNames: Record<BrandVariant, string> = {
  amigo: 'VIVO AMIGO',
  pay: 'PAY VIVO AMIGO',
  cargo: 'CARGO VIVO AMIGO'
};

export function VivoBrandLogo({ compact = false, href = 'https://vivoamigo.com', light = false, variant = 'amigo' }: VivoBrandLogoProps) {
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const brandName = brandNames[variant];
  const accent = variant === 'pay' ? '#38BDF8' : '#FF6A00';

  useEffect(() => {
    const syncLogo = () => setCustomLogo(window.localStorage.getItem(BRAND_LOGO_STORAGE_KEY));
    syncLogo();
    window.addEventListener('storage', syncLogo);
    window.addEventListener('vivo-brand-logo-updated', syncLogo);
    return () => {
      window.removeEventListener('storage', syncLogo);
      window.removeEventListener('vivo-brand-logo-updated', syncLogo);
    };
  }, []);

  const monogram = variant === 'pay' ? 'VP' : 'VA';
  const content = <span className="notranslate inline-flex items-center gap-2.5" translate="no" aria-label={brandName}>
    {customLogo && variant === 'amigo' ? <Image src={customLogo} alt={`${brandName} logo`} width={40} height={40} unoptimized className="h-10 w-10 shrink-0 rounded-lg object-contain" /> : <svg viewBox="0 0 48 48" role="img" aria-labelledby={`vivo-logo-title-${variant} vivo-logo-desc-${variant}`} className="h-10 w-10 shrink-0" xmlns="http://www.w3.org/2000/svg">
      <title id={`vivo-logo-title-${variant}`}>{brandName} monogram</title>
      <desc id={`vivo-logo-desc-${variant}`}>Matte black shield with a one-pixel orange orbital ring and metallic monogram.</desc>
      <defs><linearGradient id={`vivo-silver-${variant}`} x1="0" x2="1"><stop stopColor="#F8FAFC" /><stop offset="0.5" stopColor="#94A3B8" /><stop offset="1" stopColor="#E2E8F0" /></linearGradient></defs>
      <ellipse cx="24" cy="24" rx="21" ry="12.5" fill="none" stroke="#FF6A00" strokeWidth="1" transform="rotate(-28 24 24)" />
      <path d="M24 5.5 38 10.2v12c0 9.7-5.5 16.8-14 20.3-8.5-3.5-14-10.6-14-20.3v-12L24 5.5Z" fill="#111318" stroke="#020304" strokeWidth="1.2" />
      <text x="24" y="29.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="14" letterSpacing="-1"><tspan fill={`url(#vivo-silver-${variant})`}>{monogram[0]}</tspan><tspan fill={accent}>{monogram[1]}</tspan></text>
    </svg>}
    {!compact && <span className={`text-sm font-extrabold tracking-[0.1em] ${light ? 'text-white' : 'text-[#25262C]'}`}><span className="bg-gradient-to-r from-slate-100 via-slate-300 to-slate-500 bg-clip-text text-transparent">{brandName}</span></span>}
  </span>;

  return <span className="inline-flex items-center gap-2">
    {href ? <Link href={href} aria-label={`${brandName} home`} className="inline-flex items-center gap-2">{content}{!compact && variant === 'amigo' && <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-white/75 transition hover:border-[#FF6A00] hover:text-[#FF6A00]"><Home size={16} /></span>}</Link> : content}
  </span>;
}
