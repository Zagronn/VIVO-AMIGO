'use client';

import React, { useState } from 'react';
import { DriverQrVerificationCard } from './DriverQrVerificationCard';

interface LogisticsTelematicsPanelProps {
  vehicleId: string;
  driverName: string;
  plateNumber: string;
  safetyScore: number;
  deliveryCount: number;
  currentSpeedKmh: number;
  maxSpeedLimitKmh: number;
  onTrackingRefresh?: () => Promise<void>;
}

export const LogisticsTelematicsPanel = (props: LogisticsTelematicsPanelProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const speeding = props.currentSpeedKmh > props.maxSpeedLimitKmh;

  const refreshTracking = async () => {
    if (!props.onTrackingRefresh) return;
    setIsRefreshing(true);
    setTrackingError(null);
    try { await props.onTrackingRefresh(); } catch (error) { setTrackingError(error instanceof Error ? error.message : 'No se pudo actualizar el rastreo.'); } finally { setIsRefreshing(false); }
  };

  return (
    <section className="space-y-3" aria-label={`Telemática CARGO VIVO ${props.vehicleId}`}>
      <div className="flex items-center justify-between rounded-xl border border-[#25D366]/30 bg-[#111111] p-4 text-white">
        <div><p className="text-xs font-bold uppercase tracking-wider text-[#25D366]">CARGO VIVO · Transportamos Vidas</p><p className="mt-1 text-xs text-gray-400">{speeding ? `Alerta: ${props.currentSpeedKmh} km/h` : `${props.currentSpeedKmh} km/h · Conducción segura`}</p></div>
        <button type="button" onClick={refreshTracking} disabled={isRefreshing} className="rounded-lg bg-[#FF6A00] px-3 py-2 text-xs font-bold text-black disabled:opacity-60">{isRefreshing ? 'Actualizando...' : 'Actualizar GPS'}</button>
      </div>
      {trackingError && <p role="alert" className="text-xs text-red-400">{trackingError}</p>}
      <DriverQrVerificationCard driverName={props.driverName} plateNumber={props.plateNumber} safetyScore={props.safetyScore} deliveryCount={props.deliveryCount} />
    </section>
  );
};
