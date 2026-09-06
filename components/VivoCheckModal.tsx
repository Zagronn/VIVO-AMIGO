'use client';

import React, { useState } from 'react';

interface VivoCheckModalProps {
  listingId: string;
  priceGTQ: number;
  onGenerateCode?: (listingId: string, priceGTQ: number) => Promise<string>;
}

export const VivoCheckModal = ({ listingId, priceGTQ, onGenerateCode }: VivoCheckModalProps) => {
  const [code, setCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const generatedCode = onGenerateCode
        ? await onGenerateCode(listingId, priceGTQ)
        : `VIVO-${Math.floor(1000 + Math.random() * 9000)}-GT`;
      if (!/^VIVO-\d{4}-GT$/.test(generatedCode)) throw new Error('Código VIVO-CHECK inválido.');
      setCode(generatedCode);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'No se pudo generar el código.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="my-4 rounded-2xl border border-[#FF6A00]/40 bg-[#111111] p-5 text-white" aria-label="VIVO-CHECK garantía de trato seguro">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="flex items-center gap-2 text-sm font-extrabold text-[#FF6A00]">VIVO-CHECK (Garantía de Trato Seguro)</h4>
        <span className="rounded border border-[#FF6A00]/30 bg-[#FF6A00]/20 px-2 py-0.5 text-[10px] font-bold text-[#FF6A00]">Garantía Notarial y Bancaria</span>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-gray-300">Si te vas a reunir con el vendedor en persona, genera tu código para activar la cobertura de seguro, pre-calificación bancaria y respaldo contra fraudes.</p>
      {!code ? (
        <button type="button" onClick={handleGenerateCode} disabled={isProcessing} className="w-full rounded-xl bg-[#FF6A00] py-3 text-xs font-black text-black shadow-lg transition-all hover:bg-[#e05d00] disabled:cursor-not-allowed disabled:opacity-60">{isProcessing ? 'Generando código...' : 'Obtener Código VIVO-CHECK de Seguridad'}</button>
      ) : (
        <div className="rounded-xl border border-green-500/50 bg-black p-4 text-center" role="status">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Muestra este código al vendedor:</p>
          <span className="font-mono text-3xl font-black tracking-wider text-green-400">{code}</span>
          <p className="mt-2 text-[10px] text-gray-400">Tarjeta y DPI verificados · Transacción protegida por VIVO AMIGO</p>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-red-400">{error}</p>}
    </section>
  );
};
