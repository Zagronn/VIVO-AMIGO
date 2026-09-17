'use client';

import React, { useState } from 'react';

type Partner = 'BANCO_INDUSTRIAL' | 'BANRURAL' | 'TIGO' | 'CLARO';

export const PayVivoMigrationOnboarding = () => {
  const [partner, setPartner] = useState<Partner>('BANCO_INDUSTRIAL');
  const [externalId, setExternalId] = useState('');
  const [digitalIdentity, setDigitalIdentity] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [message, setMessage] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!consentGiven) { setMessage('Debes aceptar el consentimiento antes de continuar.'); return; }
    setMessage('Solicitud recibida. La identidad VERI-SHIELD y la migración requieren validación del partner.');
  };

  return <main className="min-h-screen bg-[#070312] p-6 font-sans text-white"><div className="mx-auto max-w-2xl space-y-6"><header className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"><span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 font-mono text-[10px] font-bold text-emerald-300">payvivoamigo.com · GREAT MIGRATION</span><h1 className="mt-3 text-2xl font-black">Migración VivoPay</h1><p className="mt-2 text-xs text-gray-400">Consentimiento claro, Digital Trade ID y migración validada por partner.</p></header><form onSubmit={submit} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6"><label className="block text-xs text-gray-400">Partner<select value={partner} onChange={(e) => setPartner(e.target.value as Partner)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white"><option value="BANCO_INDUSTRIAL">Banco Industrial</option><option value="BANRURAL">Banrural</option><option value="TIGO">Tigo</option><option value="CLARO">Claro</option></select></label><label className="block text-xs text-gray-400">External ID<input required value={externalId} onChange={(e) => setExternalId(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white" /></label><label className="block text-xs text-gray-400">Digital Trade ID<input required value={digitalIdentity} onChange={(e) => setDigitalIdentity(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white" /></label><label className="flex gap-3 text-xs text-gray-300"><input type="checkbox" checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} />Acepto la migración, los términos de privacidad y la comunicación del partner.</label><button type="submit" className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-xs font-bold">Iniciar migración segura</button>{message && <p className="text-xs text-amber-200" role="status">{message}</p>}</form></div></main>;
};