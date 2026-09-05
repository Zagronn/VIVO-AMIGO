'use client';

import React from 'react';

interface StoreRentBadgeProps {
  storeName: string;
  nextDueDate: string;
  isPaid: boolean;
}

export const StoreRentBadge = ({ storeName, nextDueDate, isPaid }: StoreRentBadgeProps) => {
  const handlePaymentRedirect = () => {
    window.location.href = '/checkout?amount=50&type=STORE_RENTAL';
  };

  return (
    <div className="my-3 flex items-center justify-between rounded-2xl border border-gray-800 bg-[#111111] p-4 text-white">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{storeName}</span>
          {isPaid ? (
            <span role="status" className="rounded-full border border-green-500/30 bg-green-900/40 px-2 py-0.5 text-[10px] font-bold text-green-400">Tienda Activa (Q50/mes)</span>
          ) : (
            <span role="status" className="rounded-full border border-red-500/30 bg-red-900/40 px-2 py-0.5 text-[10px] font-bold text-red-400">Pago Pendiente</span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-400">{isPaid ? `Próximo pago: ${nextDueDate}` : 'Renta mensual de Q50 vencida'}</p>
      </div>
      {!isPaid && <button type="button" onClick={handlePaymentRedirect} className="rounded-xl bg-[#FF6A00] px-4 py-2 text-xs font-extrabold text-black transition-all hover:bg-[#e05d00]" aria-label={`Pagar Q50 para ${storeName}`}>Pagar Q50</button>}
    </div>
  );
};
