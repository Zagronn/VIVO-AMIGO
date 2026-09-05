'use client';

import React, { useMemo } from 'react';

interface AdManagerProps {
  zone: string;
  userSearchIntent?: string;
}

interface DirectAd {
  bannerUrl: string;
  targetLink: string;
  brandName: string;
}

const BYD_AD: DirectAd = {
  brandName: 'BYD Guatemala',
  bannerUrl: 'https://cdn.vivoamigo.com/ads/byd-electric-takeover.webp',
  targetLink: 'https://wa.me/50200000000?text=Hola%20BYD!%20Quiero%20informacion%20del%20Test%20Drive'
};

export const AdManager = ({ zone, userSearchIntent }: AdManagerProps) => {
  const directAd = useMemo<DirectAd | null>(() => {
    return userSearchIntent?.toLowerCase().includes('toyota') ? BYD_AD : null;
  }, [userSearchIntent]);

  if (directAd) {
    return (
      <aside className="my-4 w-full rounded-2xl border border-[#FF6A00] bg-gradient-to-r from-gray-900 to-black p-3" data-zone={zone} aria-label={`Anuncio patrocinado de ${directAd.brandName}`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00]">Patrocinado por {directAd.brandName}</span>
          <span className="rounded bg-[#FF6A00]/20 px-2 py-0.5 text-[9px] text-[#FF6A00]">Oficial</span>
        </div>
        <a href={directAd.targetLink} target="_blank" rel="noopener noreferrer" aria-label={`Contactar a ${directAd.brandName} por WhatsApp`}>
          <img src={directAd.bannerUrl} alt={`${directAd.brandName} Test Drive`} className="w-full rounded-xl object-cover" />
        </a>
      </aside>
    );
  }

  return (
    <aside className="my-4 flex min-h-[100px] w-full items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/50" data-zone={zone} aria-label="Espacio publicitario">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
};
