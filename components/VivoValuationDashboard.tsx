import React from 'react';
import { calculate24MonthValuation } from '../services/ecosystemProjection';

export const VivoValuationDashboard = () => {
  const projection = calculate24MonthValuation();
  const money = (value: number) => `$${value.toLocaleString('en-US')} USD`;

  return (
    <section className="mx-auto my-8 max-w-4xl rounded-3xl border border-purple-500/30 bg-[#070312] p-8 text-white shadow-2xl backdrop-blur-2xl" aria-label="VIVO AMIGO 24 month strategic projection">
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4"><div><span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 font-mono text-xs font-bold text-purple-400">VIVOAMIGO · Proyección Estratégica a 24 Meses</span><h2 className="mt-2 text-2xl font-extrabold text-white">Valoración Objetivo: $100M+ USD</h2></div><div className="text-right"><p className="font-mono text-[10px] text-gray-400">ESTADO DE ARQUITECTURA</p><p className="font-mono text-xs font-bold text-emerald-400">VIVO-CHECK Safe Escrow Ready</p></div></div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="font-mono text-[10px] uppercase text-gray-400">GMV Anual Proyectado</p><p className="mt-1 text-xl font-extrabold text-white">{money(projection.projectedGMV)}</p><p className="mt-1 text-[10px] text-purple-300">Projection model, not a market guarantee</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="font-mono text-[10px] uppercase text-gray-400">Ingreso Neto Anual</p><p className="mt-1 text-xl font-extrabold text-emerald-400">{money(projection.projectedNetRevenue)}</p><p className="mt-1 text-[10px] text-emerald-300/80">Comisiones + VIVO-ASSIST + BIFinance targets</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="font-mono text-[10px] uppercase text-gray-400">Valoración Múltiple (8x-10x)</p><p className="mt-1 text-xl font-extrabold text-amber-400">{money(projection.companyValuationMin)} - {money(projection.companyValuationMax)}</p><p className="mt-1 text-[10px] text-amber-300/80">Target model for regional exit/M&amp;A</p></div>
      </div>
      <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-4 text-xs leading-relaxed text-gray-300"><strong className="text-white">Security gates and evidence policy:</strong><p className="mt-1">VIVO-CHECK escrow, RENAP identity validation, consent controls, and automated security tests are required before release. These controls reduce risk; they are not a guarantee of zero defects or fraud.</p></div>
    </section>
  );
};
