'use client';

import React, { useState } from 'react';

type SocialPlatform = 'WHATSAPP_STATUS' | 'FACEBOOK_POST' | 'INSTAGRAM_STORY' | 'TIKTOK';

interface VivoWalletSystemProps {
  userId: string;
  balanceGTQ?: number;
  escrowLockedGTQ?: number;
}

interface VerificationResponse {
  success: boolean;
  freeDopingCreditsGranted: number;
  message: string;
}

export const VivoWalletSystem = ({ userId, balanceGTQ = 12500, escrowLockedGTQ = 3200 }: VivoWalletSystemProps) => {
  const [shareLink, setShareLink] = useState('');
  const [platform, setPlatform] = useState<SocialPlatform>('INSTAGRAM_STORY');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [creditMessage, setCreditMessage] = useState('');
  const [isRequestingCredit, setIsRequestingCredit] = useState(false);
  const [transferMode, setTransferMode] = useState<'P2P' | 'ACH'>('P2P');
  const [transferAmount, setTransferAmount] = useState(0);

  const handleDevinVerification = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsVerifying(true);
    setVerification(null);
    try {
      const response = await fetch('/api/v1/promotions/social-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, platform, sharedLinkOrScreenshotUrl: shareLink })
      });
      setVerification(await response.json() as VerificationResponse);
    } catch {
      setVerification({ success: false, freeDopingCreditsGranted: 0, message: 'No pudimos verificar el enlace. Por favor inténtalo de nuevo más tarde.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const requestBICredit = async () => {
    setIsRequestingCredit(true);
    setCreditMessage('');
    try {
      const response = await fetch('/api/v1/finance/bi/pre-approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, assetType: 'VEHICLE', assetVerifiedValueGTQ: balanceGTQ + escrowLockedGTQ, veriShieldScore: 85, requestedLoanAmountGTQ: escrowLockedGTQ }) });
      const result = await response.json() as { message?: string };
      setCreditMessage(result.message || 'Solicitud enviada a revisión.');
    } catch {
      setCreditMessage('La solicitud requiere revisión manual del socio financiero.');
    } finally {
      setIsRequestingCredit(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070312] p-6 font-sans text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:flex-row md:items-center">
          <div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-[#002E5D]/30 bg-[#002E5D] px-3 py-0.5 font-mono text-[10px] font-bold text-white">Bank-Grade Encryption</span><span className="rounded-full border border-[#FF6B00]/30 bg-[#FF6B00]/15 px-3 py-0.5 font-mono text-[10px] text-[#FF6B00]">payvivoamigo.com</span></div><h1 className="mt-2 text-2xl font-black">VivoWallet · Billetera segura</h1><p className="font-mono text-xs text-gray-400">Custodia VIVO-CHECK con controles verificables</p></div>
          <div className="text-left md:text-right"><p className="font-mono text-[10px] uppercase text-gray-400">Saldo disponible · demo</p><h2 className="font-mono text-3xl font-black text-emerald-400">Q {balanceGTQ.toLocaleString('es-GT', { minimumFractionDigits: 2 })} GTQ</h2><p className="mt-1 font-mono text-[11px] text-purple-300">Escrow retenido: Q {escrowLockedGTQ.toLocaleString('es-GT', { minimumFractionDigits: 2 })} GTQ</p><button type="button" onClick={() => setTransferMode(transferMode === 'P2P' ? 'ACH' : 'P2P')} className="mt-3 rounded-full bg-[#FF6B00] px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-orange-500/20">Transferir</button></div>
        </header>

        <section className="rounded-3xl border border-[#002E5D]/20 bg-white/[0.03] p-5 text-white" aria-label="Transfer quote"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-[10px] uppercase text-[#FF6B00]">Global transfer</p><h2 className="text-lg font-bold">{transferMode === 'P2P' ? 'Wallet a wallet' : 'Transferencia bancaria ACH'}</h2></div><span className="rounded-full bg-[#002E5D] px-3 py-1 font-mono text-[10px] font-bold text-white">{transferMode === 'P2P' ? '0 GTQ · instantáneo' : '5 GTQ · same-day ACH'}</span></div><div className="mt-4 flex gap-3"><input type="number" min="0" value={transferAmount || ''} onChange={(event) => setTransferAmount(Number(event.target.value))} placeholder="Monto GTQ" className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white" /><button type="button" className="rounded-xl bg-[#FF6B00] px-4 py-3 text-xs font-bold">Cotizar</button></div><p className="mt-3 text-[11px] text-gray-400">Quote informativo; la transferencia requiere wallet, saldo, autenticación y adapter PayVivo configurado.</p></section>

        <section className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-black to-indigo-950/40 p-6 backdrop-blur-xl" aria-labelledby="wallet-promo-title">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">45-SEC VIVOAMIGO PROMO</span><h2 id="wallet-promo-title" className="mt-1 text-lg font-bold">Comparte y solicita la verificación de tu promoción</h2></div>{verification?.success && <span className="animate-pulse rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-emerald-400">VERIFICADO · 0% COMISIÓN</span>}</div>
          <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-3"><PromoCard title="WhatsApp Status" copy="La publicación debe ser pública y contener la campaña oficial." accent="text-green-400" /><PromoCard title="Instagram Story" copy="El adapter autorizado revisa visibilidad y evidencia promocional." accent="text-pink-400" /><PromoCard title="TikTok / Shorts" copy="El enlace y hashtag oficial se verifican en servidor." accent="text-cyan-400" /></div>
          <form onSubmit={handleDevinVerification} className="space-y-3"><div className="grid grid-cols-1 gap-3 md:grid-cols-2"><select value={platform} onChange={(event) => setPlatform(event.target.value as SocialPlatform)} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white outline-none" aria-label="Plataforma social"><option value="INSTAGRAM_STORY">Instagram Story</option><option value="WHATSAPP_STATUS">WhatsApp Status</option><option value="FACEBOOK_POST">Facebook Post</option><option value="TIKTOK">TikTok</option></select><input required type="url" value={shareLink} onChange={(event) => setShareLink(event.target.value)} placeholder="https://... enlace público" className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white outline-none focus:border-purple-500" aria-label="Enlace compartido" /></div><button type="submit" disabled={isVerifying} className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 font-mono text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:from-purple-500 hover:to-indigo-500 disabled:cursor-wait disabled:opacity-60">{isVerifying ? 'Verificando publicación...' : 'Verificar publicación con Devin AI'}</button></form>
          {verification && <p className={`mt-4 rounded-xl border p-3 text-center text-xs ${verification.success ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300' : 'border-amber-500/30 bg-amber-950/30 text-amber-200'}`} role={verification.success ? 'status' : 'alert'}>{verification.message}{verification.success && ` · Créditos acreditados: +${verification.freeDopingCreditsGranted}`}</p>}
          <div className="mt-4 border-t border-white/10 pt-4"><button type="button" onClick={requestBICredit} disabled={isRequestingCredit} className="rounded-xl border border-purple-400/40 bg-purple-500/10 px-4 py-3 text-xs font-bold text-purple-200 disabled:opacity-50">{isRequestingCredit ? 'BI revisando...' : 'Solicitar crédito BI / Zigi'}</button>{creditMessage && <p className="mt-2 text-xs text-gray-400" role="status">{creditMessage}</p>}</div>
        </section>

        <section className="grid grid-cols-1 gap-4 text-xs font-mono md:grid-cols-3"><DomainCard domain="vivoamigo.com" copy="Marketplace y ecosistema de confianza" accent="text-purple-400" /><DomainCard domain="payvivoamigo.com" copy="Escrow y pagos tokenizados" accent="text-emerald-400" /><DomainCard domain="cargovivo.com" copy="Logística y asistencia vial" accent="text-indigo-400" /></section>
      </div>
    </main>
  );
};

function PromoCard({ title, copy, accent }: { title: string; copy: string; accent: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><p className={`mb-1 font-mono text-xs font-bold ${accent}`}>{title}</p><p className="text-[11px] text-gray-400">{copy}</p></div>;
}

function DomainCard({ domain, copy, accent }: { domain: string; copy: string; accent: string }) {
  return <a href={`https://${domain}`} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-purple-400/50"><span className={`mb-1 block font-bold ${accent}`}>{domain}</span><p className="text-[11px] text-gray-400">{copy}</p></a>;
}