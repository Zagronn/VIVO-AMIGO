'use client';

import React, { useState } from 'react';
import { calculateTradeInUpgrade, type TradeInAssetType, type TradeInCalculation } from '../services/tradeInUpgradeEngine';

export const TradeInUpgradeModule = ({ userId = 'current-user' }: { userId?: string }) => {
  const [assetType, setAssetType] = useState<TradeInAssetType>('VEHICLE');
  const [currentValue, setCurrentValue] = useState(65_000);
  const [targetType, setTargetType] = useState<TradeInAssetType>('VEHICLE');
  const [targetPrice, setTargetPrice] = useState(120_000);
  const [score, setScore] = useState(90);
  const [calculation, setCalculation] = useState<TradeInCalculation | null>(null);
  const [message, setMessage] = useState('');

  const calculate = (event: React.FormEvent) => {
    event.preventDefault();
    try { setCalculation(calculateTradeInUpgrade({ userId, currentAssetType: assetType, currentAssetVerifiedValueGTQ: currentValue, targetAssetType: targetType, targetAssetPriceGTQ: targetPrice, veriShieldScore: score })); setMessage(''); } catch (error) { setCalculation(null); setMessage(error instanceof Error ? error.message : 'La valoración requiere revisión.'); }
  };

  return (
    <main className="min-h-screen bg-[#06040A] p-6 font-sans text-white"><div className="mx-auto max-w-4xl space-y-6">
      <header className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"><span className="rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1 font-mono text-[10px] font-bold text-purple-300">VIVOAMIGO · TRADE-IN &amp; UPGRADE</span><h1 className="mt-3 text-2xl font-black">vivoamigo ile Hayatını Güncelle</h1><p className="mt-2 text-xs text-gray-400">Mevcut varlığını doğrulanmış peşinat olarak kullan, kalan fark için uygun finansman yolunu gör.</p></header>
      <form onSubmit={calculate} className="grid grid-cols-1 gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:grid-cols-2"><Field label="Mevcut varlık"><select value={assetType} onChange={(e) => setAssetType(e.target.value as TradeInAssetType)}><option value="VEHICLE">Araç</option><option value="REAL_ESTATE">Gayrimenkul</option><option value="TECH_DEVICE">Teknolojik cihaz</option></select></Field><Field label="Hedef varlık"><select value={targetType} onChange={(e) => setTargetType(e.target.value as TradeInAssetType)}><option value="VEHICLE">Araç</option><option value="REAL_ESTATE">Gayrimenkul</option><option value="TECH_DEVICE">Teknolojik cihaz</option></select></Field><Field label="Mevcut doğrulanmış değer GTQ"><input type="number" min="1" value={currentValue} onChange={(e) => setCurrentValue(Number(e.target.value))} /></Field><Field label="Hedef fiyat GTQ"><input type="number" min="1" value={targetPrice} onChange={(e) => setTargetPrice(Number(e.target.value))} /></Field><Field label="VERI-SHIELD skoru"><input type="number" min="0" max="100" value={score} onChange={(e) => setScore(Number(e.target.value))} /></Field><button className="self-end rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-xs font-bold">Farkı Hesapla</button></form>
      {message && <p className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-200" role="alert">{message}</p>}
      {calculation && <section className="space-y-4 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 p-6"><div className="grid grid-cols-1 gap-3 md:grid-cols-3"><Result label="Trade-in peşinatı" value={`Q ${calculation.tradeInCreditGTQ.toLocaleString('es-GT')} GTQ`} /><Result label="Finansman farkı" value={`Q ${calculation.financingGapGTQ.toLocaleString('es-GT')} GTQ`} /><Result label="Durum" value={calculation.equityPosition === 'FINANCING_REQUIRED' ? 'BI/Zigi incelemesi' : 'Peşinat yeterli'} /></div><div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-gray-300"><p>VIVO-VERIFY ile doğrulama ve Banco Industrial/Zigi kararı gereklidir; kredi onayı garanti edilmez.</p><a className="mt-2 inline-block text-cyan-300 underline" href={calculation.cargoDeliveryUrl}>CARGO VIVO teslimat akışını aç</a><p className="mt-2 font-bold text-purple-300">{calculation.campaign}</p></div></section>}
    </div></main>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs text-gray-400">{label}<span className="mt-1 block [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-white/10 [&>input]:bg-black/40 [&>input]:p-3 [&>input]:text-white [&>select]:w-full [&>select]:rounded-xl [&>select]:border [&>select]:border-white/10 [&>select]:bg-black/40 [&>select]:p-3 [&>select]:text-white">{children}</span></label>; }
function Result({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-[10px] uppercase text-gray-500">{label}</p><p className="mt-1 font-mono font-bold text-emerald-300">{value}</p></div>; }