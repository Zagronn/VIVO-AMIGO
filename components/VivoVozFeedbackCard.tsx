'use client';

import React, { useState } from 'react';

interface VivoVozFeedbackCardProps {
  initialUpvotes?: number;
  onVote?: (upvotes: number) => Promise<void>;
}

export const VivoVozFeedbackCard = ({ initialUpvotes = 998, onVote }: VivoVozFeedbackCardProps) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [status, setStatus] = useState<'ANALYZING' | 'CODING_IN_SANDBOX'>('ANALYZING');
  const [progress, setProgress] = useState(20);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async () => {
    if (isVoting) return;
    const newVotes = upvotes + 1;
    setIsVoting(true);
    setError(null);
    try {
      await onVote?.(newVotes);
      setUpvotes(newVotes);
      if (newVotes >= 1000 && status === 'ANALYZING') { setStatus('CODING_IN_SANDBOX'); setProgress(45); }
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : 'No se pudo registrar el voto.');
    } finally { setIsVoting(false); }
  };

  return (
    <article className="mx-auto my-4 max-w-lg rounded-2xl border border-[#FF6A00]/40 bg-[#111111] p-5 text-white shadow-2xl" aria-label="VIVO-VOZ laboratorio de ideas">
      <div className="mb-2 flex items-center justify-between gap-3"><span className="rounded border border-[#FF6A00]/30 bg-[#FF6A00]/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#FF6A00]">VIVO-VOZ · Laboratorio de Ideas</span><span className="font-mono text-xs text-gray-400">ID: VOZ-PhoneSwap</span></div>
      <h3 className="mt-2 text-base font-black text-white">Módulo de Trueque Seguro de Celulares y Verificación IMEI</h3>
      <p className="my-2 text-xs text-gray-400">Queremos un sistema para intercambiar celulares usados con respaldo Escrow de VIVO-CHECK y validación de IMEI robados.</p>
      <div className="my-3 rounded-xl border border-gray-800 bg-black p-4">
        <div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold text-gray-300">Estado de Desarrollo (Devin AI)</span><span className="font-mono text-xs font-bold text-[#25D366]">{Math.max(0, Math.min(100, progress))}%</span></div>
        <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-800"><div className="h-full bg-gradient-to-r from-[#FF6A00] to-[#25D366] transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>
        <div className="flex items-center justify-between"><span className="font-mono text-[10px] text-gray-400">{status === 'CODING_IN_SANDBOX' ? 'Devin AI Programando en Sandbox...' : 'Analizando Viabilidad'}</span><button type="button" onClick={handleVote} disabled={isVoting} className="flex items-center gap-1 rounded-lg bg-[#FF6A00] px-4 py-1.5 text-xs font-black text-black shadow-md transition-all hover:bg-[#e05d00] disabled:opacity-60">Votar ({upvotes})</button></div>
      </div>
      {error && <p role="alert" className="text-center text-[10px] text-red-400">{error}</p>}
      <p className="text-center text-[10px] italic text-gray-500">Propuesto por la comunidad. Las funciones con +1000 votos pasan a validación sandbox.</p>
    </article>
  );
};
