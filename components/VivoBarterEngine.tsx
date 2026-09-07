'use client';

import React, { useState } from 'react';

type Partner = 'BI' | 'TIGO' | 'CLARO';

const partnerCopy: Record<Partner, { name: string; accent: string; sender: string; title: string; body: string; exchange: string }> = {
  BI: {
    name: 'Banco Industrial',
    accent: 'purple',
    sender: 'Banco Industrial / Zigi',
    title: 'Aradığın araç ve ev, VERI-SHIELD kontrolleriyle vivoamigo.com’da',
    body: 'Seçtiğin uygun listing için banka kredi yolculuğunu payvivoamigo.com üzerinden başlat. Kredi kararı Banco Industrial onayına tabidir.',
    exchange: 'Önerilen karşılık: onaylı BI kredi akışında kampanya koşullarına bağlı ücret avantajı.'
  },
  TIGO: {
    name: 'Tigo',
    accent: 'cyan',
    sender: 'Tigo Money / Tigo Business',
    title: 'Guatemala’da güvenli ticaret dönemi',
    body: 'vivoamigo.com üzerindeki uygun ilanları keşfet; yetkilendirilmiş Tigo Money ödeme akışını kullan. Ürün ve ücret koşulları sağlayıcı onayına tabidir.',
    exchange: 'Önerilen karşılık: opt-in dağıtım ve ödeme entegrasyonu için zaman sınırlı barter pilotu.'
  },
  CLARO: {
    name: 'Claro',
    accent: 'red',
    sender: 'Claro Business',
    title: 'Güvenli pazar keşfi vivoamigo.com’da',
    body: 'Consent-gated Claro Business kanalları üzerinden güven kontrolleri açıklanan ilanları paylaş. Mesaj ve ödeme özellikleri sözleşmeli entegrasyona tabidir.',
    exchange: 'Önerilen karşılık: marka onaylı medya envanteri ve lojistik keşfi için pilot barter planı.'
  }
};

export const VivoBarterEngine = () => {
  const [activePartner, setActivePartner] = useState<Partner>('BI');
  const campaign = partnerCopy[activePartner];
  const accentStyles = { purple: 'border-purple-500/30 bg-purple-950/20 text-purple-300', cyan: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300', red: 'border-red-500/30 bg-red-950/20 text-red-300' };

  return (
    <main className="min-h-screen bg-[#06040A] p-6 font-sans text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl md:flex-row md:items-center"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-0.5 font-mono text-[10px] font-bold text-purple-300">ZERO-BUDGET PILOT PROPOSAL</span><span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-0.5 font-mono text-[10px] font-bold text-emerald-400">vivoamigo.com</span></div><h1 className="mt-2 text-2xl font-black">Dijital Barter &amp; Kampanya Motoru</h1><p className="font-mono text-xs text-gray-400">Sıfır medya bütçeli pilot; partner, consent ve sözleşme onayına tabi</p></div><div className="flex rounded-2xl border border-white/10 bg-black/60 p-1 text-xs font-mono">{(['BI', 'TIGO', 'CLARO'] as Partner[]).map((partner) => <button key={partner} type="button" onClick={() => setActivePartner(partner)} aria-pressed={activePartner === partner} className={`rounded-xl px-3 py-1.5 transition-all ${activePartner === partner ? `bg-${partner === 'BI' ? 'purple' : partner === 'TIGO' ? 'cyan' : 'red'}-600 font-bold text-white` : 'text-gray-400 hover:text-white'}`}>{partner === 'BI' ? 'Banco Industrial' : partner}</button>)}</div></header>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 font-mono"><h2 className={`text-sm font-bold ${accentStyles[campaign.accent as keyof typeof accentStyles].split(' ').pop()}`}>{campaign.sender} · propuesta de campaña</h2><div className={`space-y-2 rounded-2xl border p-4 text-xs ${accentStyles[campaign.accent as keyof typeof accentStyles]}`}><p className="text-gray-200"><strong>Título:</strong> {campaign.title}</p><p className="text-[11px] text-gray-300"><strong>Texto:</strong> {campaign.body}</p></div><p className="text-[11px] text-emerald-300">Propuesta de intercambio: {campaign.exchange}</p><p className="text-[10px] text-gray-500">No se envía SMS, se activa zero-rating ni se cambia una tarifa sin consentimiento, API autorizada y acuerdo firmado.</p></section>

        <aside className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-black to-indigo-950/40 p-5 font-mono text-xs text-gray-300"><p className="font-bold text-purple-300">Principio de valor circular</p><p className="mt-1 text-[11px] text-gray-400">Cada partner aporta un canal aprobado; vivoamigo aporta verificación, atribución y una experiencia de comercio auditable. Los resultados se miden por piloto, no se presumen como cobertura garantizada.</p></aside>
      </div>
    </main>
  );
};