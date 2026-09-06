'use client';

import React, { useState } from 'react';

type PartnershipTab = 'BI' | 'TIGO';

export const BankPartnershipProposal = () => {
  const [activeTab, setActiveTab] = useState<PartnershipTab>('BI');

  return (
    <main className="min-h-screen bg-[#06040A] p-6 font-sans text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl md:flex-row md:items-center"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-0.5 font-mono text-[10px] font-bold text-purple-300">STRATEGIC ALLIANCE DECK</span><span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-0.5 font-mono text-[10px] font-bold text-emerald-400">vivoamigo.com</span></div><h1 className="mt-2 text-2xl font-black">Banca &amp; GSM · Simulador de alianza</h1><p className="font-mono text-xs text-gray-400">VERI-SHIELD apoyado por controles verificables</p></div><div className="flex rounded-2xl border border-white/10 bg-black/60 p-1"><button type="button" onClick={() => setActiveTab('BI')} aria-pressed={activeTab === 'BI'} className={`rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${activeTab === 'BI' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-gray-400 hover:text-white'}`}>Banco Industrial · Zigi</button><button type="button" onClick={() => setActiveTab('TIGO')} aria-pressed={activeTab === 'TIGO'} className={`rounded-xl px-4 py-2 text-xs font-mono font-bold transition-all ${activeTab === 'TIGO' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'text-gray-400 hover:text-white'}`}>Tigo Money · Business</button></div></header>

        {activeTab === 'BI' ? <ProposalPanel tone="purple" title="Banco Industrial (BI) & Zigi" subtitle="Propuesta de crédito y wallet sujeta a aprobación del socio financiero" badge="Win-Win · Propuesta" items={[
          ['Precalificación de auto', 'Botón de crédito contextual en listings elegibles; el banco conserva decisión, KYC y underwriting.'],
          ['Escrow payvivoamigo.com', 'Transferencias de alto valor pueden conectarse a escrow mediante un adapter aprobado e idempotente.'],
          ['Integración Zigi', 'Explorar carga de wallet y pagos con autorización del proveedor, términos comerciales y controles PCI aplicables.']
        ]} quote="BI puede llegar al usuario en el momento de compra con datos de verificación auditables; la aprobación crediticia permanece en manos del banco." /> : <ProposalPanel tone="cyan" title="Tigo Money & Tigo Business" subtitle="Propuesta de distribución y pagos sujeta a acuerdo comercial" badge="Barter · Propuesta" items={[
          ['Zero-rating', 'Evaluar acceso patrocinado a vivoamigo.com y cargovivo.com conforme a políticas de red, neutralidad y aprobación contractual.'],
          ['Tigo Money', 'Explorar pagos de marketplace y logística mediante APIs autorizadas, límites, reversos e idempotencia.'],
          ['SMS y push', 'Campañas opt-in y consentidas con atribución, frecuencia, privacidad y aprobación de marca.']
        ]} quote="Tigo puede ampliar el alcance de pagos y logística; la disponibilidad, cobertura y cuota de mercado deben validarse con el socio." />}
      </div>
    </main>
  );
};

function ProposalPanel({ tone, title, subtitle, badge, items, quote }: { tone: 'purple' | 'cyan'; title: string; subtitle: string; badge: string; items: string[][]; quote: string }) {
  const styles = tone === 'purple' ? { title: 'text-purple-300', accent: 'text-purple-400', panel: 'border-purple-500/30 bg-purple-950/20' } : { title: 'text-cyan-300', accent: 'text-cyan-400', panel: 'border-cyan-500/30 bg-cyan-950/20' };
  return <section className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6"><div className="flex items-center justify-between border-b border-white/10 pb-4"><div><h2 className={`text-lg font-bold ${styles.title}`}>{title}</h2><p className="font-mono text-xs text-gray-400">{subtitle}</p></div><span className={`rounded-full border px-3 py-1 text-xs font-mono font-bold ${styles.title} ${styles.panel}`}>{badge}</span></div><div className="grid grid-cols-1 gap-4 text-xs font-mono md:grid-cols-3">{items.map(([heading, copy], index) => <div key={heading} className="rounded-2xl border border-white/10 bg-black/40 p-4"><span className={`mb-1 block font-bold ${styles.accent}`}>{index + 1}. {heading}</span><p className="text-[11px] text-gray-400">{copy}</p></div>)}</div><div className={`rounded-2xl border p-4 text-xs font-mono ${styles.panel}`}><p className={`font-bold ${styles.title}`}>Valor propuesto al socio</p><p className="mt-1 text-[11px] text-gray-300">{quote}</p></div></section>;
}