'use client';

import React, { useEffect, useState } from 'react';
import { MailLeadWidget } from './MailLeadWidget';
import type { AIAnalyzedMail } from '../services/aiMailHandlerService';

interface SecurityStatus {
  isEmergencyLockActive: boolean;
  activeThreatLevel: 'NORMAL' | 'ELEVATED_RISK' | 'CRITICAL_ATTACK';
  totalBlockedAttempts: number;
  vaultStatus: 'ENCRYPTED_SECURE' | 'ISOLATED';
}

const INITIAL_STATUS: SecurityStatus = {
  isEmergencyLockActive: false,
  activeThreatLevel: 'NORMAL',
  totalBlockedAttempts: 14,
  vaultStatus: 'ENCRYPTED_SECURE'
};

const fleets = [
  ['VIVO-VERIFY', '#001-#050', '50 agentes registrados'],
  ['VIVO-CHECK', '#051-#100', '50 agentes registrados'],
  ['VIVO-VIRAL', '#101-#150', '50 agentes registrados'],
  ['CYBER DEFENSE', '#151-#200', '50 agentes registrados'],
  ['SUNCOREX ANALYTICS', '#201-#250', '50 agentes registrados']
];

const DEMO_B2B_LEAD: AIAnalyzedMail = {
  originalMailId: 'sales-demo-001',
  channel: 'SALES',
  category: 'HIGH_VALUE_B2B',
  priorityScore: 9,
  aiSummary: 'Institutional partnership lead awaiting executive review.',
  draftedResponse: 'Estimado socio, recibimos su solicitud de alianza. Nuestro equipo comercial revisará el perfil institucional.',
  requiresHumanAction: true
};

export const VivoAdminDashboard = () => {
  const [securityStatus, setSecurityStatus] = useState(INITIAL_STATUS);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocking, setIsLocking] = useState(false);
  const [message, setMessage] = useState('');
  const [leadMessage, setLeadMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    fetch('/v1/security/status')
      .then((response) => {
        if (!response.ok) throw new Error('Estado de seguridad no disponible.');
        return response.json() as Promise<SecurityStatus>;
      })
      .then((status) => { if (mounted) setSecurityStatus(status); })
      .catch((error: Error) => { if (mounted) setMessage(error.message); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleEmergencyLock = async () => {
    setIsLocking(true);
    setMessage('');
    try {
      const response = await fetch('/v1/security/emergency-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggeredBy: 'executive-control-center' })
      });
      if (!response.ok) throw new Error('No se pudo activar el bloqueo de emergencia.');
      setSecurityStatus(await response.json() as SecurityStatus);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error de seguridad desconocido.');
    } finally {
      setIsLocking(false);
    }
  };

  const isLocked = securityStatus.isEmergencyLockActive;

  return (
    <main className="min-h-screen bg-[#05020a] p-6 font-sans text-white">
      <header className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center">
        <div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-purple-400">Executive Control Center</span><span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 font-mono text-[10px] font-bold text-emerald-400">250 agentes registrados</span></div><h1 className="mt-2 text-2xl font-black text-white">vivoamigo System Dashboard</h1><p className="font-mono text-xs text-gray-400">Slogan oficial: <strong>Llevamos Vidas, Transportamos Confianza</strong></p></div>
        <button type="button" onClick={handleEmergencyLock} disabled={isLocked || isLocking || isLoading} className={`rounded-xl px-4 py-2.5 font-mono text-xs font-bold shadow-lg transition-all ${isLocked || isLocking ? 'animate-pulse cursor-not-allowed bg-red-600 text-white shadow-red-600/40' : 'border border-white/15 bg-white/5 text-gray-300 hover:bg-white/10'}`}>{isLocked ? 'SYSTEM LOCKDOWN ACTIVE' : isLocking ? 'ACTIVANDO BLOQUEO...' : 'EMERGENCY LOCK'}</button>
      </header>

      <section className="mx-auto my-8 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-4" aria-label="Operational metrics">
        <Metric label="Volumen GMV Acumulado" value="$1,420,000 USD" note="Escenario dashboard" />
        <Metric label="Custodia VIVO-CHECK" value="Q485,000 GTQ" note="Datos de demostración" accent="text-purple-400" />
        <Metric label="Validaciones VIVO-VERIFY" value="99.8%" note="Métrica ilustrativa" accent="text-emerald-400" />
        <Metric label="Red NVIDIA NIM Swarm" value="250 / 250" note="Agentes registrados" accent="text-indigo-400" />
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl"><h2 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider">Estado de flotas</h2><div className="space-y-3 text-xs font-mono">{fleets.map(([name, range, state]) => <div key={name} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"><span>{name} ({range})</span><span className="whitespace-nowrap text-emerald-400">{state}</span></div>)}</div></div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl lg:col-span-2"><h2 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider">Estado de seguridad</h2><div className="grid grid-cols-2 gap-3 text-xs"><Metric label="Threat level" value={isLoading ? 'Consultando...' : securityStatus.activeThreatLevel} accent={isLocked ? 'text-red-400' : 'text-emerald-400'} /><Metric label="Vault" value={securityStatus.vaultStatus === 'ISOLATED' ? 'Aislado' : 'Cifrado seguro'} accent="text-cyan-300" /><Metric label="Intentos bloqueados" value={String(securityStatus.totalBlockedAttempts)} /><Metric label="Escrow / OTP" value={isLocked ? 'Pausados' : 'Operativos'} accent={isLocked ? 'text-red-400' : 'text-emerald-400'} /></div>{message && <p className="mt-4 text-xs text-amber-200" role="alert">{message}</p>}</div>
      </section>
      <section className="mx-auto mt-6 max-w-7xl rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl" aria-labelledby="b2b-leads-title"><div className="mb-3 flex items-center justify-between"><h2 id="b2b-leads-title" className="font-mono text-sm font-bold uppercase tracking-wider">High-priority B2B opportunities</h2><span className="rounded-full border border-[#FF6B00]/30 bg-[#FF6B00]/10 px-3 py-1 font-mono text-[10px] text-[#FFB38A]">sales@vivoamigo.com</span></div><MailLeadWidget lead={DEMO_B2B_LEAD} onApprove={() => setLeadMessage('Draft approved for human review; no email was sent automatically.')} />{leadMessage && <p className="text-xs text-emerald-300" role="status">{leadMessage}</p>}</section>
    </main>
  );
};

function Metric({ label, value, note, accent = 'text-white' }: { label: string; value: string; note?: string; accent?: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl"><p className="font-mono text-[10px] uppercase text-gray-400">{label}</p><p className={`mt-1 text-2xl font-black ${accent}`}>{value}</p>{note && <span className="mt-2 inline-block font-mono text-[10px] text-gray-500">{note}</span>}</div>;
}