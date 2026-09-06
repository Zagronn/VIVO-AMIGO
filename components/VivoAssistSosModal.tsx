'use client';

import React, { useState } from 'react';

type SosIssue = 'TOW_TRUCK' | 'FLAT_TIRE' | 'BATTERY_JUMP';
interface ActiveSos { id: string; price: number; etaMinutes: number; }

export const VivoAssistSosModal = ({ onTriggerSos }: { onTriggerSos?: (issue: SosIssue) => Promise<ActiveSos> }) => {
  const [isActivating, setIsActivating] = useState(false);
  const [activeSos, setActiveSos] = useState<ActiveSos | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTriggerSos = async (issue: SosIssue) => {
    if (isActivating) return;
    setIsActivating(true);
    setError(null);
    try {
      const result = onTriggerSos ? await onTriggerSos(issue) : { id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`, price: issue === 'TOW_TRUCK' ? 310 : 120, etaMinutes: 12 };
      setActiveSos(result);
    } catch (activationError) {
      setError(activationError instanceof Error ? activationError.message : 'No se pudo activar VIVO-ASSIST.');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <section className="my-4 rounded-2xl border border-red-600/50 bg-[#111111] p-5 text-white shadow-2xl" aria-label="VIVO-ASSIST auxilio vial 24/7">
      <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-black text-sm text-red-500">VIVO-ASSIST · Auxilio Vial 24/7</h3><span className="rounded border border-red-600/30 bg-red-600/20 px-2.5 py-1 text-[10px] font-bold uppercase text-red-400">Tarifa Fija Garantizada</span></div>
      <p className="mb-4 text-xs text-gray-300">Solicita grúa o auxilio mecánico inmediato con precio transparente e integración Escrow.</p>
      {!activeSos ? (
        <div className="grid grid-cols-3 gap-2">
          {([['TOW_TRUCK', 'Grúa Exprés', '🛞'], ['FLAT_TIRE', 'Pinchazo', '🔧'], ['BATTERY_JUMP', 'Batería', '⚡']] as const).map(([issue, label, icon]) => <button key={issue} type="button" onClick={() => handleTriggerSos(issue)} disabled={isActivating} className="flex flex-col items-center justify-center rounded-xl border border-gray-700 bg-gray-800 p-3 text-center text-white transition-all hover:bg-gray-700 disabled:opacity-60"><span className="mb-1 text-xl" aria-hidden="true">{icon}</span><span className="text-[10px] font-bold uppercase">{isActivating ? 'Activando...' : label}</span></button>)}
        </div>
      ) : (
        <div className="rounded-xl border border-green-500/50 bg-black p-4" role="status"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold text-green-400">Unidad VIVO-ASSIST asignada ({activeSos.id})</span><span className="font-mono text-xs font-bold text-[#FF6A00]">Q{activeSos.price}.00 GTQ</span></div><p className="text-xs text-gray-300">Llegada estimada en <strong className="text-white">{activeSos.etaMinutes} minutos</strong> a tu ubicación GPS actual.</p><div className="mt-3 flex items-center justify-between border-t border-gray-800 pt-2 text-[10px] text-gray-400"><span>Pago retenido en Escrow Seguro</span><span className="font-bold text-green-400">Unidad con rastreo GPS</span></div></div>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-red-400">{error}</p>}
    </section>
  );
};
