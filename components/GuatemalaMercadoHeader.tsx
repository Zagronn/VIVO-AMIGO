'use client';

import React, { useState } from 'react';

const ZONAS = Array.from({ length: 21 }, (_, index) => `Zona ${index + 1}`);
type QuickNeed = 'pharmacies' | 'fuel' | 'freight';

export function openSellerWhatsApp(sellerPhone: string, itemTitle: string): void {
  const normalizedPhone = sellerPhone.replace(/[^\d+]/g, '');
  const msg = encodeURIComponent(`Hola! Vi tu anuncio "${itemTitle}" en VIVO AMIGO. ¿Sigue disponible?`);
  window.open(`https://wa.me/${normalizedPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
}

interface GuatemalaMercadoHeaderProps {
  initialZone?: string;
  onZoneChange?: (zone: string) => void;
  onQuickNeed?: (need: QuickNeed) => void;
}

export const GuatemalaMercadoHeader = ({
  initialZone = '',
  onZoneChange,
  onQuickNeed
}: GuatemalaMercadoHeaderProps) => {
  const [selectedZone, setSelectedZone] = useState(initialZone);

  const handleZoneChange = (zone: string) => {
    setSelectedZone(zone);
    onZoneChange?.(zone);
  };

  return (
    <header className="border-b border-[#7A808A]/30 bg-[#111111] p-4 text-white">
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-2 text-xs">
        <button type="button" onClick={() => onQuickNeed?.('pharmacies')} className="flex-shrink-0 rounded-full border border-red-500/50 bg-red-900/40 px-3 py-1.5 text-red-400">
          Farmacias Abiertas
        </button>
        <button type="button" onClick={() => onQuickNeed?.('fuel')} className="flex-shrink-0 rounded-full border border-amber-500/50 bg-amber-900/40 px-3 py-1.5 text-amber-400">
          Precios Combustible
        </button>
        <button type="button" onClick={() => onQuickNeed?.('freight')} className="flex-shrink-0 rounded-full border border-[#FF6A00]/50 bg-[#FF6A00]/20 px-3 py-1.5 text-[#FF6A00]">
          Solicitud de Flete (CARGO VIVO)
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-[#1e1e1e] p-2">
        <label htmlFor="guatemala-zone" className="whitespace-nowrap text-sm font-bold text-[#FF6A00]">Seleccionar Zona:</label>
        <select
          id="guatemala-zone"
          value={selectedZone}
          onChange={(event) => handleZoneChange(event.target.value)}
          className="flex-1 bg-transparent text-sm font-semibold text-white focus:outline-none"
        >
          <option value="" className="bg-black text-white">Todas las Zonas (Todo Guatemala)</option>
          {ZONAS.map((zone) => <option key={zone} value={zone} className="bg-black text-white">{zone}</option>)}
        </select>
      </div>
    </header>
  );
};
