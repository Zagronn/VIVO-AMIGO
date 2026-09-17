import React from 'react';

interface ShieldBadgeProps {
  partnerName: string;
  insuredValueGTQ: number;
}

export const InsuranceShieldBadge = ({ partnerName, insuredValueGTQ }: ShieldBadgeProps) => {
  if (!partnerName.trim()) throw new Error('partnerName is required');
  if (!Number.isFinite(insuredValueGTQ) || insuredValueGTQ < 0) throw new Error('insuredValueGTQ must be non-negative');
  return <aside className="my-3 flex w-full items-center justify-between rounded-2xl border border-[#6ee7b7]/30 bg-[#002E5D]/95 p-4 text-white shadow-2xl backdrop-blur-lg" role="status" aria-label="Insurance partner status"><div className="flex items-center gap-3.5"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#10b981]/40 bg-[#10b981]/20 text-xl" aria-hidden="true">Shield</div><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-[#10b981]/30 bg-[#10b981]/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#6ee7b7]">Official assurance partner</span><span className="text-xs font-bold text-slate-300">{partnerName}</span></div><p className="mt-1 text-xs font-medium text-slate-200">Partner şartlarına tabi kapsam tutarı: <span className="font-bold text-[#6ee7b7]">Q {insuredValueGTQ.toLocaleString('es-GT')}</span></p></div></div><div className="hidden border-l border-white/10 pl-4 text-right sm:block"><span className="block font-mono text-[10px] uppercase text-slate-400">VERI-SHIELD + INSURANCE</span><span className="text-xs font-extrabold text-[#FF6B00]">TERMS VERIFIED</span></div></aside>;
};