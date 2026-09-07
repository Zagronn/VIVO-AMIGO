'use client';

import React, { useState } from 'react';

type TrackerStatus = 'LOCKED_FUNDS' | 'IN_TRANSIT' | 'CUSTOMS_CLEARED' | 'DELIVERED_RELEASED' | 'INSURED_REFUND';

export const VivoTrustEscrowTracker = ({ status = 'LOCKED_FUNDS' }: { status?: TrackerStatus }) => {
  const [gtipHsCode, setGtipHsCode] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const steps: Array<[TrackerStatus, string]> = [['LOCKED_FUNDS', 'Fondos bloqueados'], ['IN_TRANSIT', 'En tránsito'], ['CUSTOMS_CLEARED', 'Aduana validada'], ['DELIVERED_RELEASED', 'Entregado · liberado']];
  const activeIndex = steps.findIndex(([step]) => step === status);
  return <section className="rounded-3xl border border-[#002E5D]/30 bg-[#002E5D] p-6 text-white" aria-label="VIVO-TRUST Global Escrow"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="rounded-full border border-[#27AE60]/40 bg-[#27AE60]/20 px-3 py-1 text-[10px] font-bold text-[#9FF0BC]">Eximbank Grade VIVO-TRUST Protection</span><h2 className="mt-3 text-xl font-extrabold">Global Escrow Protection</h2></div><span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[10px]">{status}</span></div><div className="mt-5 grid gap-2 sm:grid-cols-4">{steps.map(([step, label], index) => <div key={step} className={`rounded-xl border p-3 text-xs ${index <= activeIndex ? 'border-[#27AE60]/50 bg-[#27AE60]/15 text-[#D8FFE4]' : 'border-white/10 bg-white/5 text-white/50'}`}><span className="block font-bold">{index + 1}</span>{label}</div>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs text-white/70">GTIP / HS Code<input value={gtipHsCode} onChange={(event) => setGtipHsCode(event.target.value)} placeholder="HS 8703.23" className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white outline-none" /></label><label className="text-xs text-white/70">Bill of Lading / AWB<input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Tracking number" className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white outline-none" /></label></div><p className="mt-4 text-[11px] text-white/60">Funds release only follows verified customs/delivery provider signals. Shipment failure routes to insured importer refund review.</p></section>;
};