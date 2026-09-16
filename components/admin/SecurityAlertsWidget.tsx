'use client';

import React, { useEffect, useState } from 'react';
import CiaTelemetryModal, { TelemetryTargetUser } from './CiaTelemetryModal';
import { playSciFiSound } from './soundEffects';

interface SecurityData {
  databaseStatus: {
    connection: string;
    latency: string;
    activePools: string;
    sslShield: string;
  };
  systemAlerts: Array<{
    id: string;
    level: string;
    message: string;
    timestamp: string;
  }>;
}

export default function SecurityAlertsWidget() {
  const [telemetry, setTelemetry] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTarget, setSelectedTarget] = useState<TelemetryTargetUser | null>(null);

  useEffect(() => {
    async function fetchSecurityData() {
      try {
        const res = await fetch('/api/admin/security');
        const json = await res.json();
        if (json.success) {
          setTelemetry(json.data);
        }
      } catch (err) {
        console.error('Failed to load security telemetry', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSecurityData();
  }, []);

  const inspectAlertTarget = (alert: { id: string; level: string; message: string; timestamp: string }) => {
    playSciFiSound(alert.level === 'CRITICAL' ? 'error' : 'radar');
    const targetMap: Record<string, TelemetryTargetUser> = {
      'ALT-501': {
        id: 'TARGET-501',
        name: 'Restricted Subnet Operator',
        email: 'subnet-breach@sec-proxy.org',
        country: 'Guatemala (Zona 10)',
        avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%23ff5500" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>',
        ipAddress: '190.148.12.84',
        threatLevel: 'ELEVATED_RISK'
      },
      'ALT-502': {
        id: 'AGENT-502',
        name: 'Automated Backup Daemon',
        email: 'checkpoint-daemon@vivoamigo.com',
        country: 'AWS RDS us-east-1',
        avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%2322c55e" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>',
        ipAddress: '10.0.4.12',
        threatLevel: 'NOMINAL'
      },
      'ALT-503': {
        id: 'ROGUE-503',
        name: 'Unauthorized Query Infiltrator',
        email: 'intercept@tor-node-04.net',
        country: 'Tor Exit Node (Unknown)',
        avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%23ef4444" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
        ipAddress: '185.220.101.5',
        threatLevel: 'CRITICAL_ALERT'
      }
    };

    const target = targetMap[alert.id] || {
      id: `TARGET-${alert.id}`,
      name: `Subject ${alert.id}`,
      email: `flagged-entity-${alert.id.toLowerCase()}@darknode.net`,
      country: 'Guatemala',
      avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%23ff5500" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>',
      ipAddress: '190.56.241.110',
      threatLevel: alert.level
    };

    setSelectedTarget(target);
  };

  return (
    <>
      <div className="border border-[#ff5500]/40 p-5 rounded bg-black/95 shadow-[0_0_20px_rgba(255,85,0,0.2)] font-mono text-[#ff5500]">
        <div className="flex justify-between items-center border-b border-[#ff5500]/30 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">
              // CORE SHIELD: DB & SECURITY TELEMETRY
            </h3>
            <p className="text-[10px] opacity-70 mt-0.5">SOVEREIGN OS DEFENSE GRID</p>
          </div>
          <span className="text-[10px] px-2 py-1 border border-[#ff5500] bg-[#ff5500]/10 animate-pulse">
            FIREWALL: ACTIVE
          </span>
        </div>

        {loading ? (
          <p className="text-xs opacity-70 py-6 text-center">Scanning system partitions...</p>
        ) : telemetry ? (
          <div className="space-y-4">
            {/* Database Health Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
              <div className="border border-[#ff5500]/30 p-2 bg-black">
                <p className="text-[10px] opacity-60">DB CONNECTION</p>
                <p className="text-xs font-bold text-white mt-1">{telemetry.databaseStatus.connection}</p>
              </div>
              <div className="border border-[#ff5500]/30 p-2 bg-black">
                <p className="text-[10px] opacity-60">LATENCY</p>
                <p className="text-xs font-bold text-[#ff5500] mt-1">{telemetry.databaseStatus.latency}</p>
              </div>
              <div className="border border-[#ff5500]/30 p-2 bg-black">
                <p className="text-[10px] opacity-60">ACTIVE POOLS</p>
                <p className="text-xs font-bold text-white mt-1">{telemetry.databaseStatus.activePools}</p>
              </div>
              <div className="border border-[#ff5500]/30 p-2 bg-black">
                <p className="text-[10px] opacity-60">SSL SHIELD</p>
                <p className="text-xs font-bold text-green-400 mt-1">{telemetry.databaseStatus.sslShield}</p>
              </div>
            </div>

            {/* System Alerts Feed */}
            <div className="border border-[#ff5500]/20 p-3 bg-black/60 rounded">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold tracking-wider">// REAL-TIME SECURITY ALERTS</p>
                <span className="text-[10px] opacity-60">KLİKLE: HEDEFİ İNCELE [CIA TELEMETRY]</span>
              </div>
              <div className="space-y-2">
                {telemetry.systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => inspectAlertTarget(alert)}
                    className="flex justify-between items-center text-xs border-b border-[#ff5500]/10 pb-2 cursor-pointer hover:bg-[#ff5500]/10 px-1 py-0.5 transition-colors rounded"
                  >
                    <div>
                      <span className={`text-[9px] px-1.5 py-0.5 border mr-2 ${
                        alert.level === 'CRITICAL' ? 'border-red-500 text-red-400' :
                        alert.level === 'WARNING' ? 'border-yellow-500 text-yellow-400' :
                        'border-[#ff5500] text-[#ff5500]'
                      }`}>
                        {alert.level}
                      </span>
                      <span className="opacity-90">{alert.message}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] opacity-50">{alert.timestamp}</span>
                      <span className="text-[9px] border border-[#ff5500]/50 px-1 py-0.5 bg-[#ff5500]/20 hover:bg-[#ff5500] hover:text-black transition-colors">
                        [INSPECT]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-red-500">Telemetry feed offline.</p>
        )}
      </div>

      {/* CIA Telemetry Target Modal */}
      <CiaTelemetryModal
        user={selectedTarget}
        onClose={() => setSelectedTarget(null)}
      />
    </>
  );
}
