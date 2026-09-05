'use client';

import React, { useState } from 'react';

interface CardVerificationBadgeProps {
  dpiName: string;
  onVerify?: () => Promise<boolean>;
}

export const CardVerificationBadge = ({ dpiName, onVerify }: CardVerificationBadgeProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyCard = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = onVerify ? await onVerify() : true;
      if (!result) throw new Error('No se pudo verificar la tarjeta.');
      setVerified(true);
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : 'No se pudo verificar la tarjeta.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="my-3 rounded-md border border-gray-200 bg-white p-4 shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">Card Verification Required</h4>
          <p className="mt-0.5 text-xs text-gray-500">Titular requerido: <strong className="text-slate-800">{dpiName}</strong></p>
        </div>
        {verified ? (
          <span role="status" className="rounded bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">Verificado</span>
        ) : (
          <button type="button" onClick={handleVerifyCard} disabled={isProcessing} className="rounded bg-[#FF6A00] px-3.5 py-2 text-xs font-extrabold text-black transition-all hover:bg-[#e05d00] disabled:cursor-not-allowed disabled:opacity-60">
            {isProcessing ? 'Verificando...' : 'Vincular Tarjeta (Q1.00)'}
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
};
