'use client';

import React, { useState } from 'react';

type CritiqueStatus = 'ANALYZING_BY_DEVIN' | 'HOTFIX_DEPLOYED';

export const VivoCritiqueModal = ({ onSubmitCritique }: { onSubmitCritique?: (comment: string) => Promise<CritiqueStatus> }) => {
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<CritiqueStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedComment = comment.trim();
    if (!trimmedComment) return;
    setStatus('ANALYZING_BY_DEVIN');
    setError(null);
    try {
      if (onSubmitCritique) setStatus(await onSubmitCritique(trimmedComment));
    } catch (submitError) {
      setStatus(null);
      setError(submitError instanceof Error ? submitError.message : 'No se pudo enviar la crítica.');
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-purple-500/30 bg-[#070312] p-6 text-white shadow-2xl backdrop-blur-xl" aria-label="VIVO-CRITIQUE feedback">
      <div className="mb-4 flex items-center justify-between"><span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 font-mono text-xs font-bold text-purple-400">VIVO-CRITIQUE · Sistema Self-Healing</span><span className="animate-pulse font-mono text-[10px] text-emerald-400">Devin AI Active</span></div>
      <h3 className="mb-1 text-lg font-bold">¿Encontraste un problema o falla?</h3>
      <p className="mb-4 text-xs leading-relaxed text-gray-400">Tu crítica es analizada por nuestro agente de IA. Las fallas se enrutan según su severidad y aprobación requerida.</p>
      <form onSubmit={handleSubmit} className="space-y-3"><label className="sr-only" htmlFor="vivo-critique-comment">Crítica</label><textarea id="vivo-critique-comment" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Describe el problema observado..." className="h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-gray-500 transition-all focus:border-purple-500 focus:outline-none" required /><button type="submit" disabled={status === 'ANALYZING_BY_DEVIN'} className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60">Enviar Crítica a Devin AI</button></form>
      {status === 'ANALYZING_BY_DEVIN' && <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-950/40 p-3 text-center"><p className="animate-pulse font-mono text-xs text-purple-300">Devin AI analizando logs y código fuente...</p></div>}
      {status === 'HOTFIX_DEPLOYED' && <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-center"><p className="font-mono text-xs font-bold text-emerald-400">Hot-Fix Aplicado según pipeline de validación.</p></div>}
      {error && <p role="alert" className="mt-3 text-xs text-red-400">{error}</p>}
    </section>
  );
};
