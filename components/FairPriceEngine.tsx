'use client';

import React, { useState } from 'react';

interface FairPriceEngineProps {
  minMarketValue?: number;
  maxMarketValue?: number;
  initialAskingPrice?: number;
}

export const FairPriceEngine = ({ minMarketValue = 44_000, maxMarketValue = 48_000, initialAskingPrice = 46_500 }: FairPriceEngineProps) => {
  const [askingPrice, setAskingPrice] = useState(initialAskingPrice);
  const hardCapPrice = maxMarketValue * 1.2;
  const isFairPrice = askingPrice >= minMarketValue && askingPrice <= maxMarketValue;
  const isSlightlyHigh = askingPrice > maxMarketValue && askingPrice <= hardCapPrice;
  const isPriceGouging = askingPrice > hardCapPrice;

  return (
    <main className="min-h-screen bg-[#06040A] p-6 font-sans text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-0.5 font-mono text-[10px] font-bold text-purple-300">VERI-SHIELD · DVM ENGINE</span><span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-0.5 font-mono text-[10px] font-bold text-emerald-400">vivoamigo.com</span></div><h1 className="mt-2 text-2xl font-black">Dinamik Piyasa Değeri &amp; Fiyat Denetçisi</h1><p className="font-mono text-xs text-gray-400">Adil fiyatlandırma ve alıcı koruma kalkanı</p></header>

        <section className="grid grid-cols-1 gap-4 font-mono text-xs md:grid-cols-3" aria-label="Market valuation summary"><ValueCard label="VERI-SHIELD MİN. DEĞER" value={minMarketValue} accent="text-emerald-400" /><ValueCard label="VERI-SHIELD MAX. DEĞER" value={maxMarketValue} accent="text-purple-400" /><ValueCard label="FAHİŞ FİYAT ENGEL SINIRI (%20)" value={hardCapPrice} accent="text-red-400" /></section>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6"><label className="block text-xs font-mono text-gray-300" htmlFor="asking-price">Satıcının belirlediği ilan fiyatı (GTQ):</label><input id="asking-price" type="number" min="0" value={askingPrice} onChange={(event) => setAskingPrice(Number(event.target.value))} className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-lg font-mono font-bold text-emerald-400 outline-none focus:border-purple-500" />
          {isFairPrice && <StatusPanel tone="emerald" title="DÜRÜST FİYAT TESPİT EDİLDİ · TEŞVİK UYGUNLUĞU" copy={<>İlanınız VERI-SHIELD piyasa bandındadır. <strong>Promosyon ve öne çıkarma avantajları kampanya koşullarına tabidir.</strong></>} />}
          {isSlightlyHigh && <StatusPanel tone="amber" title="SARI BAYRAK · PİYASA ORTALAMASININ ÜZERİNDE" copy={<>İlan yayınlanabilir; alıcılara piyasa ortalamasının üzerinde olduğu gösterilir. Uygunluk için fiyatı Q {maxMarketValue.toLocaleString('es-GT')} seviyesine çekebilirsiniz.</>} />}
          {isPriceGouging && <StatusPanel tone="red" title="FAHİŞ FİYAT ENGELİ · İLAN REDDEDİLDİ" copy={<>Alıcı haklarını ve piyasa dengesini korumak için piyasa bandının %20 üzerindeki ilanlar yayınlanamaz.</>} />}
        </section>

        <aside className="space-y-1 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 to-indigo-950/40 p-5 font-mono text-xs"><p className="font-bold text-purple-300">Döngüsel Adalet</p><p className="text-[11px] text-gray-400">Bugün piyasa değerinde satış yaparak güven ekosistemini güçlendirirsiniz. Yarın alıcı olduğunuzda aynı kalkan fahiş fiyatlara karşı sizi korur.</p></aside>
      </div>
    </main>
  );
};

function ValueCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><span className="block text-[10px] text-gray-400">{label}</span><span className={`text-base font-bold ${accent}`}>Q {value.toLocaleString('es-GT')} GTQ</span></div>;
}

function StatusPanel({ tone, title, copy }: { tone: 'emerald' | 'amber' | 'red'; title: string; copy: React.ReactNode }) {
  const styles = { emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300', red: 'border-red-500/30 bg-red-500/10 text-red-300' };
  return <div className={`space-y-2 rounded-2xl border p-4 ${styles[tone]}`} role="status"><p className="font-mono text-xs font-bold">{title}</p><p className="text-[11px] text-gray-300">{copy}</p></div>;
}