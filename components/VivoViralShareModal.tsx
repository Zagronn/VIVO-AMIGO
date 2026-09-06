'use client';

import React, { useState } from 'react';

type SocialPlatform = 'WHATSAPP_STATUS' | 'FACEBOOK_POST' | 'INSTAGRAM_STORY' | 'TIKTOK';
type VerificationStatus = 'IDLE' | 'VERIFYING' | 'SUCCESS' | 'ERROR';

interface VivoViralShareModalProps {
  userId: string;
}

interface VerificationResponse {
  success: boolean;
  commissionRate: number;
  freeDopingCreditsGranted: number;
  message: string;
}

export const VivoViralShareModal = ({ userId }: VivoViralShareModalProps) => {
  const [shareLink, setShareLink] = useState('');
  const [platform, setPlatform] = useState<SocialPlatform>('INSTAGRAM_STORY');
  const [status, setStatus] = useState<VerificationStatus>('IDLE');
  const [response, setResponse] = useState<VerificationResponse | null>(null);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('VERIFYING');
    setResponse(null);
    try {
      const apiResponse = await fetch('/api/v1/promotions/social-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, platform, sharedLinkOrScreenshotUrl: shareLink })
      });
      const result = await apiResponse.json() as VerificationResponse;
      setResponse(result);
      setStatus(result.success ? 'SUCCESS' : 'ERROR');
    } catch {
      setResponse({ success: false, commissionRate: 0.035, freeDopingCreditsGranted: 0, message: 'No pudimos verificar el enlace. Por favor inténtalo de nuevo más tarde.' });
      setStatus('ERROR');
    }
  };

  return (
    <section className="mx-auto my-6 max-w-lg rounded-3xl border border-purple-500/30 bg-[#070312] p-6 text-white shadow-2xl backdrop-blur-2xl" aria-labelledby="viral-share-title">
      <div className="mb-4 text-center">
        <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-purple-400">VIVO-VIRAL · 0% de comisión</span>
        <h2 id="viral-share-title" className="mt-2 text-xl font-extrabold text-white">¿Quieres tu primera venta con 0% comisión?</h2>
        <p className="mt-1 text-xs text-gray-400">Mira nuestro video oficial de 45 segundos y compártelo en tus redes.</p>
      </div>

      <div className="group relative mb-4 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/60" aria-label="Vista previa del video Llevamos Vidas">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-purple-950/80 to-transparent" />
        <span className="text-4xl transition-transform group-hover:scale-110" aria-hidden="true">Play</span>
        <span className="absolute bottom-3 left-3 font-mono text-[10px] text-purple-300">Llevamos Vidas · Promo Oficial 45s</span>
      </div>

      <form onSubmit={handleVerify} className="space-y-3">
        <label className="block text-[10px] font-mono uppercase text-gray-400">Red social<select value={platform} onChange={(event) => setPlatform(event.target.value as SocialPlatform)} className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white outline-none focus:border-purple-500"><option value="INSTAGRAM_STORY">Instagram Story</option><option value="WHATSAPP_STATUS">WhatsApp Status</option><option value="FACEBOOK_POST">Facebook Post</option><option value="TIKTOK">TikTok</option></select></label>
        <label className="block text-[10px] font-mono uppercase text-gray-400">Enlace de tu publicación o historia<input type="url" value={shareLink} onChange={(event) => setShareLink(event.target.value)} placeholder="https://instagram.com/stories/..." className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white outline-none transition-all focus:border-purple-500" required /></label>
        <button type="submit" disabled={status === 'VERIFYING'} className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-xs font-bold transition-all shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 disabled:cursor-wait disabled:opacity-60">{status === 'VERIFYING' ? 'Verificando publicación...' : 'Validar publicación'}</button>
      </form>

      {status === 'VERIFYING' && <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-950/40 p-3 text-center"><p className="animate-pulse text-xs font-mono text-purple-300">Analizando el enlace de la publicación...</p></div>}
      {response && status === 'SUCCESS' && <div className="mt-4 space-y-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-center"><p className="text-xs font-bold text-emerald-400">Verificación exitosa. Tu comisión para la primera transacción es 0%.</p><p className="text-[10px] text-gray-300">Créditos de promoción acreditados: +{response.freeDopingCreditsGranted}</p></div>}
      {response && status === 'ERROR' && <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-center text-xs text-amber-200" role="alert">{response.message}</p>}
    </section>
  );
};