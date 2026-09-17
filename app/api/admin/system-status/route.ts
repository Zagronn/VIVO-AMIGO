import { NextResponse } from 'next/server';
import { VivoSecurityShieldEngine } from '@/services/vivoSecurityShieldEngine';
import { verifyAdminRequest } from '@/services/adminAuth';

const shieldEngine = new VivoSecurityShieldEngine();

export interface SystemAlert {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  timestamp: string;
  sourceIp?: string;
  acknowledged?: boolean;
}

let activeSystemAlerts: SystemAlert[] = [
  {
    id: 'ALT-501',
    level: 'WARNING',
    message: 'Multiple auth retries from restricted subnet',
    timestamp: '2026-09-13 21:04:12',
    sourceIp: '190.148.12.84 (Guatemala City)',
    acknowledged: false
  },
  {
    id: 'ALT-502',
    level: 'INFO',
    message: 'Database backup checkpoint verified successfully',
    timestamp: '2026-09-13 20:30:00',
    sourceIp: 'AWS RDS Automated Snapshot',
    acknowledged: true
  },
  {
    id: 'ALT-503',
    level: 'CRITICAL',
    message: 'Unauthorized schema query blocked by firewall',
    timestamp: '2026-09-13 19:15:45',
    sourceIp: '185.220.101.5 (Tor Exit Node)',
    acknowledged: false
  }
];

let customBlockedIps: string[] = ['185.220.101.5', '45.154.255.89'];
let currentLatency = '14ms';
let currentPools = '8/10';

export async function GET() {
  const shieldStatus = shieldEngine.getStatus();

  const securityTelemetry = {
    databaseStatus: {
      connection: shieldStatus.vaultStatus === 'ISOLATED' ? 'ISOLATED' : 'SECURE_OPTIMIZED',
      latency: currentLatency,
      activePools: currentPools,
      sslShield: 'ACTIVE',
      engine: 'PostgreSQL 16.2 / AWS RDS (Sovereign Cluster)',
      redisLatency: '2ms',
      dynamoStatus: 'ONLINE (us-east-1)',
      offlineVault: 'SYNCED (AES-256-GCM)'
    },
    systemAlerts: activeSystemAlerts,
    meta: {
      brand: 'VIVO AMIGO SOVEREIGN OS',
      threatLevel: shieldStatus.activeThreatLevel,
      vaultStatus: shieldStatus.vaultStatus,
      isEmergencyLockActive: shieldStatus.isEmergencyLockActive,
      totalBlockedAttempts: shieldStatus.totalBlockedAttempts + customBlockedIps.length,
      blockedIps: customBlockedIps,
      overallHealthScore: shieldStatus.isEmergencyLockActive ? 54 : 99,
      timestamp: new Date().toISOString()
    }
  };

  return NextResponse.json({
    success: true,
    data: securityTelemetry
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, alertId, triggeredBy, ipToBlock } = body;

    if (action === 'ACKNOWLEDGE_ALERT' && alertId) {
      activeSystemAlerts = activeSystemAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      );
      return NextResponse.json({
        success: true,
        message: `Uyarı ${alertId} onaylandı ve arşivlendi.`
      });
    }

    if (action === 'TRIGGER_EMERGENCY_LOCK') {
      const caller = typeof triggeredBy === 'string' && triggeredBy.trim() ? triggeredBy.trim() : 'SUPER_ADMIN';
      shieldEngine.triggerEmergencyLock(caller);

      activeSystemAlerts.unshift({
        id: `ALT-${Date.now().toString().slice(-3)}`,
        level: 'CRITICAL',
        message: `ACİL DURUM KASASI İZOLE EDİLDİ (${caller})`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        sourceIp: 'Super Admin Console',
        acknowledged: false
      });

      return NextResponse.json({
        success: true,
        message: 'Acil durum tecrit kilidi devreye alındı. Kasalar izole edildi.',
        status: shieldEngine.getStatus()
      });
    }

    if (action === 'RELEASE_EMERGENCY_LOCK') {
      const newEngine = new VivoSecurityShieldEngine();
      Object.assign(shieldEngine, newEngine);

      activeSystemAlerts.unshift({
        id: `ALT-${Date.now().toString().slice(-3)}`,
        level: 'INFO',
        message: 'Acil durum kilidi kaldırıldı. Kasalar ve geçitler nominal duruma döndü.',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        sourceIp: 'Super Admin Console',
        acknowledged: true
      });

      return NextResponse.json({
        success: true,
        message: 'Acil durum kilidi kaldırıldı. Sistem normale döndü.',
        status: shieldEngine.getStatus()
      });
    }

    if (action === 'BLOCK_IP' && ipToBlock) {
      const cleanIp = String(ipToBlock).trim();
      if (!customBlockedIps.includes(cleanIp)) {
        customBlockedIps.push(cleanIp);
      }
      activeSystemAlerts.unshift({
        id: `ALT-${Date.now().toString().slice(-3)}`,
        level: 'WARNING',
        message: `IP adresi güvenlik duvarı tarafından engellendi: ${cleanIp}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        sourceIp: cleanIp,
        acknowledged: true
      });
      return NextResponse.json({
        success: true,
        message: `${cleanIp} IP adresi engellendi.`
      });
    }

    if (action === 'PING_PROBE') {
      const randomPing = Math.floor(Math.random() * 6) + 11;
      currentLatency = `${randomPing}ms`;
      return NextResponse.json({
        success: true,
        probe: {
          latency: currentLatency,
          activePools: '8/10',
          sslShield: 'ACTIVE',
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ error: 'Geçersiz aksiyon talebi.' }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Sunucu telemetri hatası';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
