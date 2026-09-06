import React from 'react';

interface DriverQrVerificationCardProps {
  driverName: string;
  plateNumber: string;
  safetyScore: number;
  deliveryCount: number;
}

export const DriverQrVerificationCard = ({ driverName, plateNumber, safetyScore, deliveryCount }: DriverQrVerificationCardProps) => {
  const safeSafetyScore = Math.max(0, Math.min(100, Math.round(safetyScore)));
  const safeDeliveryCount = Math.max(0, Math.floor(deliveryCount));

  return (
    <article className="mx-auto my-3 max-w-md rounded-2xl border border-[#25D366]/40 bg-[#111111] p-5 text-white shadow-2xl" aria-label={`Conductor verificado ${driverName}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded border border-[#25D366]/30 bg-[#25D366]/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#25D366]">CARGO VIVO · Transportamos Vidas</span>
        <span className="font-mono text-xs text-gray-400">{plateNumber}</span>
      </div>
      <div className="my-3">
        <h3 className="text-lg font-black text-white">{driverName}</h3>
        <p className="text-xs text-gray-400">Conductor Verificado por DPI y VIVO AMIGO Shield</p>
      </div>
      <div className="my-3 grid grid-cols-2 gap-3 rounded-xl border border-gray-800 bg-black p-3">
        <div><p className="text-[10px] font-bold uppercase text-gray-500">Puntaje de Conducción</p><p className="text-xl font-black tabular-nums text-[#FF6A00]">{safeSafetyScore} / 100</p></div>
        <div><p className="text-[10px] font-bold uppercase text-gray-500">Entregas Seguras</p><p className="text-xl font-black tabular-nums text-green-400">{safeDeliveryCount}+</p></div>
      </div>
      <p className="pt-1 text-center text-[10px] italic text-gray-400">Unidad equipada con rastreo GPS en tiempo real y garantía Escrow.</p>
    </article>
  );
};
