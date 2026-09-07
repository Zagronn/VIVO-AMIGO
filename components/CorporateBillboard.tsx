'use client';

import React, { useEffect } from 'react';
import type { AdOffer } from '../types/ecosystem';

interface AdPartnerFields {
  partnerName: string;
  headline: string;
  subtext: string;
  ctaText: string;
  logoUrl: string;
  targetCategory?: string;
  partnerLink: string;
  onImpression?: (event: { partnerName: string; targetCategory?: string }) => void;
  onClick?: (event: { partnerName: string; targetCategory?: string }) => void;
  assurancePartner?: boolean;
}

type AdPartnerProps = AdPartnerFields | { offer: AdOffer; onImpression?: AdPartnerFields['onImpression']; onClick?: AdPartnerFields['onClick'] };

function safeExternalUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('partnerLink must use HTTPS');
  return url.toString();
}

export const CorporateBillboard = (props: AdPartnerProps) => {
  const fields = 'offer' in props ? { ...props.offer, onImpression: props.onImpression, onClick: props.onClick } : props;
  const { partnerName, headline, subtext, ctaText, logoUrl, targetCategory, partnerLink, onImpression, onClick, assurancePartner = false } = fields;
  const safePartnerLink = safeExternalUrl(partnerLink);
  const event = { partnerName, targetCategory };

  useEffect(() => {
    onImpression?.(event);
  }, [onImpression, partnerName, targetCategory]);

  return <article className="my-4 w-full rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-[#FF6B00]/50 hover:bg-white/15"><div className="mb-2 flex items-center justify-between"><span className="rounded-full border border-[#10b981]/30 bg-[#002E5D]/80 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#6ee7b7]">{assurancePartner ? 'Official Assurance Partner' : 'Verified Alliance'}</span><span className="text-[11px] font-medium text-slate-400">{partnerName}</span></div><div className="flex items-center gap-4"><div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 p-2"><img loading="lazy" decoding="async" src={logoUrl} alt={`${partnerName} logo`} className="max-h-full max-w-full object-contain" /></div><div className="flex-1"><h2 className="text-sm font-bold leading-snug tracking-tight text-white">{headline}</h2><p className="mt-0.5 text-xs text-slate-300">{subtext}</p></div><a href={safePartnerLink} target="_blank" rel="noopener noreferrer" onClick={() => onClick?.(event)} className="flex-shrink-0 rounded-xl bg-[#FF6B00] px-4 py-2 text-xs font-bold text-white shadow-lg transition-all hover:bg-[#e05e00]">{ctaText}</a></div></article>;
};