'use client';

import React, { FormEvent, useMemo, useState } from 'react';
import { GuatemalaMercadoHeader } from './GuatemalaMercadoHeader';
import { VoiceListingInput } from './VoiceListingInput';
import { WhatsAppDirectButton } from './WhatsAppDirectButton';

interface MarketplaceItem {
  id: string;
  title: string;
  vendor: string;
  phone: string;
  price: string;
  zone: string;
  isOfficialDealer?: boolean;
}

const ITEMS: MarketplaceItem[] = [
  { id: 'coffee-01', title: 'Cafe de Altura 500g', vendor: 'La Esquina', phone: '+50255550101', price: 'Q18.00', zone: 'Zona 1' },
  { id: 'byd-01', title: 'BYD Dolphin Test Drive', vendor: 'BYD Guatemala', phone: '+50255550102', price: 'Consultar', zone: 'Zona 10', isOfficialDealer: true },
  { id: 'craft-01', title: 'Canasta tejida', vendor: 'Manos Vivas', phone: '+50255550103', price: 'Q145.00', zone: 'Zona 4' }
];

export const GuatemalaMarketplaceExperience = () => {
  const [selectedZone, setSelectedZone] = useState('');
  const [quickNeed, setQuickNeed] = useState('');
  const [description, setDescription] = useState('');
  const [listingStatus, setListingStatus] = useState('');

  const visibleItems = useMemo(
    () => ITEMS.filter((item) => !selectedZone || item.zone === selectedZone),
    [selectedZone]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setListingStatus(description.trim() ? 'Tu anuncio está listo para revisión.' : 'Agrega una descripción antes de publicar.');
  };

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      <GuatemalaMercadoHeader
        initialZone={selectedZone}
        onZoneChange={setSelectedZone}
        onQuickNeed={(need) => setQuickNeed(need)}
      />
      {quickNeed && <p className="border-b border-[#7A808A]/20 bg-[#1e1e1e] px-4 py-3 text-sm text-[#7A808A]">Servicio seleccionado: {quickNeed}</p>}

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00]">VIVO AMIGO MARKETPLACE</p>
              <h1 className="mt-2 text-3xl font-bold">Compra local, directo al vendedor.</h1>
            </div>
            <span className="text-sm text-[#7A808A]">{visibleItems.length} anuncios</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {visibleItems.map((item) => (
              <article key={item.id} className="rounded-xl border border-[#7A808A]/30 bg-[#191919] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7A808A]">{item.vendor} · {item.zone}</p>
                <h2 className="mt-3 text-xl font-bold">{item.title}</h2>
                <p className="my-4 text-2xl font-bold tabular-nums text-[#FF6A00]">{item.price}</p>
                <WhatsAppDirectButton phone={item.phone} title={item.title} isOfficialDealer={item.isOfficialDealer} />
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-xl border border-[#7A808A]/30 bg-[#191919] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00]">Publicar anuncio</p>
          <h2 className="mt-2 text-2xl font-bold">Describe lo que vendes</h2>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium" htmlFor="listing-description">Descripción</label>
            <textarea
              id="listing-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28 w-full rounded-lg border border-[#7A808A]/40 bg-[#111111] p-3 text-white outline-none focus:border-[#FF6A00]"
              placeholder="Ej. Vendo café de altura, entrega en Zona 1..."
            />
            <VoiceListingInput onTranscriptionComplete={setDescription} />
            <button type="submit" className="w-full rounded-lg bg-[#FF6A00] px-4 py-3 font-bold text-black">Publicar para revisión</button>
            {listingStatus && <p role="status" className="text-sm text-[#7A808A]">{listingStatus}</p>}
          </form>
        </aside>
      </section>
    </main>
  );
};
