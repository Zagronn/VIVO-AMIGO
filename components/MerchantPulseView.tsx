'use client';

import React from 'react';
import { VivoVoiceEngine, type DemandPrediction } from '../services/vivoVoiceEngine';

const pulseLayers = [
  ['VERI-SHIELD', 'Price and identity controls', 'text-emerald-400'],
  ['PAY VIVO', 'Wallet and escrow ledger', 'text-cyan-300'],
  ['VIVO-INSURE', 'Partner policy quotes', 'text-amber-300'],
  ['VIVO-TRUST', 'Locked funds and release gates', 'text-purple-300']
];

export const MerchantPulseView = ({ region = 'Guatemala City - Zona 10' }: { region?: string }) => {
  const predictions: DemandPrediction[] = new VivoVoiceEngine().getRegionalDemandMap(region);
  return <section className="rounded-3xl border border-[#002E5D]/20 bg-white p-6 shadow-sm" aria-labelledby="merchant-pulse-title"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#FF6B00]">Merchant Pulse</span><h2 id="merchant-pulse-title" className="mt-2 text-2xl font-extrabold">Regional demand intelligence</h2><p className="mt-1 text-xs text-black/50">Forecast signals require fresh aggregate data; they are not guaranteed demand.</p></div><span className="rounded-full bg-[#002E5D] px-3 py-1 font-mono text-[10px] font-bold text-white">{region}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{predictions.map((prediction) => <div key={`${prediction.region}-${prediction.category}`} className="rounded-2xl border border-black/10 bg-[#F8F9FA] p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold">{prediction.category}</span><span className="font-mono text-sm font-extrabold text-[#16A34A]">+{prediction.projectedDemandIncreasePercent}%</span></div><p className="mt-2 text-xs text-black/55">{prediction.recommendedStockAdjustment}</p></div>)}</div><div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">{pulseLayers.map(([name, description, color]) => <div key={name} className="rounded-xl border border-black/10 p-3"><span className={`block text-xs font-extrabold ${color}`}>{name}</span><span className="mt-1 block text-[10px] text-black/45">{description}</span><span className="mt-2 block text-[10px] font-bold text-[#16A34A]">Ready · adapter gated</span></div>)}</div></section>;
};