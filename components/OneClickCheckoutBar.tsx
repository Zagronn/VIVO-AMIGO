'use client';

import React, { useState } from 'react';

interface OneClickCheckoutProps {
  itemId: string;
  itemTitle: string;
  priceGTQ: number;
  isGoldMember: boolean;
  onSuccess: (txId: string) => void;
  authorize?: (request: { itemId: string; itemTitle: string; amountGTQ: number; authMethod: 'PASSKEY_OR_WALLET' }) => Promise<{ authorized: boolean; transactionId?: string }>;
}

export const OneClickCheckoutBar = ({ itemId, itemTitle, priceGTQ, isGoldMember, onSuccess, authorize }: OneClickCheckoutProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleOneClickPurchase = async () => {
    if (!itemId.trim() || !itemTitle.trim() || !Number.isFinite(priceGTQ) || priceGTQ <= 0) {
      setMessage('Los datos del artículo no son válidos.');
      return;
    }
    if (!authorize) {
      setMessage('La autorización biométrica o de wallet debe configurarse antes de pagar.');
      return;
    }
    setIsProcessing(true);
    setMessage('');
    try {
      const result = await authorize({ itemId, itemTitle, amountGTQ: priceGTQ, authMethod: 'PASSKEY_OR_WALLET' });
      if (!result.authorized || !result.transactionId) throw new Error('La autorización PayVivo fue rechazada.');
      onSuccess(result.transactionId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo autorizar el pago.');
    } finally {
      setIsProcessing(false);
    }
  };

  return <section className="flex w-full flex-col items-center justify-between gap-4 rounded-2xl border border-[#FF6B00]/40 bg-[#002E5D] p-4 text-white shadow-2xl sm:flex-row" aria-label="PAY VIVO one-click checkout"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B00]/20 text-xl font-bold text-[#FF6B00]" aria-hidden="true">Bolt</div><div><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FF6B00]">PAY VIVO 1-CLICK CHECKOUT</span>{isGoldMember && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-black">VIVO-GOLD · campaign terms</span>}</div><p className="mt-0.5 text-xs text-slate-300">Passkey veya wallet onayıyla PayVivo escrow intent başlat.</p></div></div><div className="w-full sm:w-auto"><button type="button" onClick={handleOneClickPurchase} disabled={isProcessing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-6 py-3 text-sm font-extrabold text-white shadow-lg transition-all hover:bg-[#e05e00] active:scale-95 disabled:cursor-wait disabled:opacity-60 sm:w-auto">{isProcessing ? <span className="animate-pulse">Authorizing...</span> : <><span>Authorize &amp; buy</span><span className="text-xs opacity-90">(Q {priceGTQ.toLocaleString('es-GT')})</span></>}</button>{message && <p className="mt-2 text-right text-[11px] text-amber-200" role="alert">{message}</p>}</div></section>;
};