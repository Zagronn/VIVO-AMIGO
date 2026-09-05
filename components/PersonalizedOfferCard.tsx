'use client';

import React from 'react';

interface PersonalizedOfferCardProps {
  sponsorBrand: string;
  offerMessage: string;
  actionLink: string;
}

export const PersonalizedOfferCard = ({ sponsorBrand, offerMessage, actionLink }: PersonalizedOfferCardProps) => {
  const safeActionLink = /^https:\/\/(wa\.me|www\.whatsapp\.com)\//.test(actionLink) ? actionLink : '#';

  return (
    <aside className="my-4 rounded-xl border border-[#FF6A00] bg-gradient-to-r from-gray-900 via-black to-gray-900 p-4 text-white shadow-lg" aria-label={`Oportunidad patrocinada de ${sponsorBrand}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="rounded border border-[#FF6A00]/20 bg-[#FF6A00]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#FF6A00]">Oportunidad Exclusiva · {sponsorBrand}</span>
        <span className="text-[9px] text-gray-400">Protegido por VIVO AMIGO Shield</span>
      </div>
      <p className="mb-3 text-xs font-medium leading-relaxed text-gray-200">{offerMessage}</p>
      <a href={safeActionLink} target="_blank" rel="noopener noreferrer" className="inline-block rounded-lg bg-[#25D366] px-4 py-2 text-xs font-extrabold text-black transition-all hover:bg-[#20ba5a]" aria-label={`Solicitar información de ${sponsorBrand} por WhatsApp`}>Solicitar Información por WhatsApp</a>
    </aside>
  );
};
