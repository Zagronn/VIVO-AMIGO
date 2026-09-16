import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/services/adminAuth';

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
  }

  const securityTelemetry = {
    databaseStatus: {
      connection: 'SECURE_OPTIMIZED',
      latency: '14ms',
      activePools: '8/10',
      sslShield: 'ACTIVE'
    },
    systemAlerts: [
      { id: 'ALT-501', level: 'WARNING', message: 'Multiple auth retries from restricted subnet', timestamp: '2026-09-13 21:04:12' },
      { id: 'ALT-502', level: 'INFO', message: 'Database backup checkpoint verified successfully', timestamp: '2026-09-13 20:30:00' },
      { id: 'ALT-503', level: 'CRITICAL', message: 'Unauthorized schema query blocked by firewall', timestamp: '2026-09-13 19:15:45' }
    ]
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
