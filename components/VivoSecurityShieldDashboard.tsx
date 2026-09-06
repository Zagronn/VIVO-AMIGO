'use client';

import React, { useEffect, useState } from 'react';
import type { SystemSecurityStatus as SecurityStatus } from '../services/vivoSecurityShieldEngine';

const INITIAL_STATUS: SecurityStatus = {
  isEmergencyLockActive: false,
  activeThreatLevel: 'NORMAL',
  totalBlockedAttempts: 14,
  vaultStatus: 'ENCRYPTED_SECURE'
};

export const VivoSecurityShieldDashboard = () => {
  const [status, setStatus] = useState<SecurityStatus>(INITIAL_STATUS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    fetch('/v1/security/status')
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo consultar el estado de seguridad.');
        return response.json() as Promise<SecurityStatus>;
      })
      .then((nextStatus) => {
        if (isMounted) setStatus(nextStatus);
      })
      .catch((requestError: Error) => {
        if (isMounted) setError(requestError.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEmergencyLock = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/v1/security/emergency-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggeredBy: 'management-panel' })
      });
      if (!response.ok) throw new Error('No se pudo activar el bloqueo de emergencia.');
      setStatus(await response.json() as SecurityStatus);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Error de seguridad desconocido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = status.isEmergencyLockActive;
  const statusLabel = isLoading ? 'CONSULTANDO ESTADO' : isLocked ? 'SYSTEM LOCKED' : 'SECURE (ZERO-TRUST)';

  return (
    <section className="mx-auto my-6 max-w-xl rounded-3xl border border-red-500/30 bg-[#070312] p-6 text-white shadow-2xl backdrop-blur-2xl" aria-labelledby="security-shield-title">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-red-400">Protocolo Escudo de Hierro</span>
          <h2 id="security-shield-title" className="mt-2 text-xl font-extrabold text-white">Centro de Control de Seguridad</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-right font-mono text-[10px] font-bold ${isLocked ? 'animate-pulse border-red-500/40 bg-red-500/20 text-red-400' : 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'}`} role="status">
          {statusLabel}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="font-mono text-[10px] text-gray-400">Biotag Liveness Detection</p>
          <p className="mt-1 font-bold text-emerald-400">Activo (RENAP Sync)</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="font-mono text-[10px] text-gray-400">VIVO-CHECK Escrow Vault</p>
          <p className="mt-1 font-bold text-purple-400">{status.vaultStatus === 'ISOLATED' ? 'Aislado' : 'Cifrado Seguro'}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="font-mono text-[10px] text-gray-400">Nivel de Amenaza</p>
          <p className="mt-1 font-bold text-amber-300">{status.activeThreatLevel}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="font-mono text-[10px] text-gray-400">Intentos Bloqueados</p>
          <p className="mt-1 font-bold text-white tabular-nums">{status.totalBlockedAttempts}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-center">
        <p className="text-xs font-medium text-red-300">Congelamiento inmediato de fondos escrow y códigos OTP:</p>
        <button type="button" onClick={handleEmergencyLock} disabled={isLocked || isSubmitting || isLoading} className={`w-full rounded-xl border py-3.5 text-xs font-black uppercase tracking-wider transition-all ${isLocked || isSubmitting ? 'cursor-not-allowed border-gray-700 bg-gray-800 text-gray-500' : 'border-red-400/30 bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white shadow-xl shadow-red-600/40 hover:from-red-500 hover:to-rose-500'}`}>
          {isLocked ? 'Bloqueo Ejecutado - Sistema Congelado' : isSubmitting ? 'Activando Bloqueo...' : 'Activar Emergency Lock'}
        </button>
        {error && <p className="text-xs text-red-200" role="alert">{error}</p>}
      </div>
    </section>
  );
};