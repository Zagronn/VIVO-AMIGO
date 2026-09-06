'use client';

import React from 'react';

interface VivoHeroRewardModalProps {
  userName?: string;
  issueTitle?: string;
  onClose?: () => void;
}

export const VivoHeroRewardModal = ({ userName = 'Serdar', issueTitle = 'Ajuste de respuesta en pasarela Visanet', onClose }: VivoHeroRewardModalProps) => (
  <section className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-purple-500/40 bg-[#070312] p-6 text-white shadow-2xl backdrop-blur-2xl" role="dialog" aria-label={`Recompensas VIVO-HERO para ${userName}`}>
    <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl" />
    <div className="mb-4 flex items-center gap-2"><span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-400">VIVO-HERO · Héroe del Sistema</span></div>
    <h2 className="mb-2 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-2xl font-extrabold text-transparent">¡Gracias, {userName}!</h2>
    <p className="mb-4 text-xs leading-relaxed text-gray-300">Soy <strong>Devin AI</strong>, el ingeniero de software de <strong>vivoamigo</strong>. He corregido el reporte <em>&quot;{issueTitle}&quot;</em> y el sistema se ha actualizado.</p>
    <div className="my-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="font-mono text-[10px] font-bold uppercase tracking-wider text-purple-400">Recompensas asignadas a tu cuenta:</p><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-sm text-purple-300">Rocket</span><div><p className="text-xs font-bold text-white">1 Doping Gratis de Anuncio</p><p className="text-[10px] text-gray-400">Posiciona tu publicación en la cima principal.</p></div></div><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-sm text-emerald-300">Tag</span><div><p className="text-xs font-bold text-white">50% Descuento en Comisión</p><p className="text-[10px] text-gray-400">Aplicable automáticamente en tu próxima venta Escrow.</p></div></div></div>
    <button type="button" onClick={onClose} className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:from-purple-500 hover:to-indigo-500">Reclamar Recompensas y Continuar</button>
  </section>
);
