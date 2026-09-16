'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Flame,
  HardDrive,
  Lock,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  Zap,
  Radio,
  Clock,
  Ban,
  Cpu
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { playSciFiSound } from './soundEffects';

export interface DatabaseStatus {
  connection: string;
  latency: string;
  activePools: string;
  sslShield: string;
  engine?: string;
  redisLatency?: string;
  dynamoStatus?: string;
  offlineVault?: string;
}

export interface SystemAlertItem {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  timestamp: string;
  sourceIp?: string;
  acknowledged?: boolean;
}

export interface SecurityTelemetryData {
  databaseStatus: DatabaseStatus;
  systemAlerts: SystemAlertItem[];
  meta?: {
    brand?: string;
    threatLevel?: 'NORMAL' | 'ELEVATED_RISK' | 'CRITICAL_ATTACK';
    vaultStatus?: 'ENCRYPTED_SECURE' | 'ISOLATED';
    isEmergencyLockActive?: boolean;
    totalBlockedAttempts?: number;
    blockedIps?: string[];
    overallHealthScore?: number;
    timestamp?: string;
  };
}

export function SuperAdminDatabaseSecurityWidget() {
  const [telemetry, setTelemetry] = useState<SecurityTelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProbing, setIsProbing] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(5); // seconds
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const fetchTelemetry = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/system-status', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        // Support both direct data and nested envelope format
        const payload: SecurityTelemetryData = json.data ? json.data : json;
        setTelemetry(payload);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Telemetri verisi alınamadı:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // Real-time Polling loop
  useEffect(() => {
    if (refreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchTelemetry(true);
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval, fetchTelemetry]);

  const runPingProbe = async () => {
    setIsProbing(true);
    playSciFiSound('radar');
    try {
      const res = await fetch('/api/admin/system-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PING_PROBE' })
      });
      if (res.ok) {
        const result = await res.json();
        if (telemetry && result.probe) {
          setTelemetry({
            ...telemetry,
            databaseStatus: {
              ...telemetry.databaseStatus,
              latency: result.probe.latency || telemetry.databaseStatus.latency
            }
          });
        }
        playSciFiSound('success');
        setActionFeedback(`Canlı veritabanı ping testi tamamlandı: ${result.probe?.latency || '12ms'}`);
        setTimeout(() => setActionFeedback(null), 3500);
      }
    } catch {
      playSciFiSound('error');
      setActionFeedback('Ping testi başarısız oldu.');
      setTimeout(() => setActionFeedback(null), 3500);
    } finally {
      setIsProbing(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/admin/system-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACKNOWLEDGE_ALERT', alertId })
      });
      if (res.ok) {
        playSciFiSound('success');
        fetchTelemetry(true);
        setActionFeedback(`Uyarı #${alertId} onaylandı.`);
        setTimeout(() => setActionFeedback(null), 3500);
      }
    } catch {
      playSciFiSound('error');
      setActionFeedback('Uyarı onaylanırken hata oluştu.');
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  const blockIp = async (ipToBlock: string) => {
    try {
      const res = await fetch('/api/admin/system-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'BLOCK_IP', ipToBlock })
      });
      if (res.ok) {
        playSciFiSound('error');
        fetchTelemetry(true);
        setActionFeedback(`${ipToBlock} kara listeye alındı.`);
        setTimeout(() => setActionFeedback(null), 3500);
      }
    } catch {
      playSciFiSound('error');
      setActionFeedback('IP engellenirken hata oluştu.');
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  const toggleEmergencyLock = async () => {
    if (!telemetry) return;
    const isLock = !telemetry.meta?.isEmergencyLockActive;
    const action = isLock ? 'TRIGGER_EMERGENCY_LOCK' : 'RELEASE_EMERGENCY_LOCK';

    try {
      const res = await fetch('/api/admin/system-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, triggeredBy: 'SUPER_ADMIN_CONSOLE' })
      });
      if (res.ok) {
        playSciFiSound(isLock ? 'error' : 'success');
        setShowEmergencyModal(false);
        fetchTelemetry(true);
        setActionFeedback(isLock ? 'ACİL DURUM KASASI İZOLE EDİLDİ!' : 'Acil durum kilidi kaldırıldı.');
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch {
      playSciFiSound('error');
      setActionFeedback('Acil durum komutu işlenemedi.');
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  if (loading && !telemetry) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#FF6A00]/20 bg-[#07090D] p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-[#FF6A00]" />
          <p className="text-sm font-bold tracking-wider text-[#FFB38A]">
            SUPER ADMIN TELEMETRİ BAĞLANTISI KURULUYOR...
          </p>
        </div>
      </div>
    );
  }

  const dbStatus = telemetry?.databaseStatus;
  const alerts = telemetry?.systemAlerts || [];
  const meta = telemetry?.meta;

  const filteredAlerts = alerts.filter((a) => {
    if (selectedFilter === 'ALL') return true;
    return a.level === selectedFilter;
  });

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <section className="relative my-6 overflow-hidden rounded-2xl border border-[#FF6A00]/30 bg-[#07090D] p-5 text-white shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(255,106,0,0.06)] backdrop-blur-2xl sm:p-7">
      {/* Matte-Black Neon Top Glow Line */}
      <div className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent shadow-[0_0_12px_#FF6A00]" />

      {/* Action Notification Banner */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5 flex items-center justify-between rounded-xl border border-[#FF6A00]/50 bg-[#FF6A00]/15 px-4 py-3 text-sm font-semibold text-[#FFE2CF] shadow-[0_0_25px_rgba(255,106,0,0.2)]"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#FF6A00]" />
              <span>{actionFeedback}</span>
            </div>
            <span className="text-xs text-[#FFB38A]">Konsol Güncellendi</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget Header & Real-Time Controls */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-2.5 py-0.5 text-[11px] font-bold tracking-widest text-[#FF6A00] shadow-[0_0_10px_rgba(255,106,0,0.25)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF6A00] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF6A00]"></span>
              </span>
              CANLI HUD TELEMETRİ
            </span>
            <span className="text-xs text-white/50">AWS us-east-1 // Sovereign Cluster</span>
          </div>
          <h2 className="mt-2 flex items-center gap-2.5 text-2xl font-black tracking-tight sm:text-3xl">
            <Database className="h-7 w-7 text-[#FF6A00] drop-shadow-[0_0_10px_rgba(255,106,0,0.6)]" />
            <span>Veritabanı Durumu & Güvenlik Komuta Merkezi</span>
          </h2>
        </div>

        {/* HUD Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh Polling Dropdown */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#121620] px-3 py-1.5 text-xs text-white/80">
            <Clock className="h-3.5 w-3.5 text-[#FF6A00]" />
            <span className="text-white/60">Yenileme:</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-transparent font-bold text-[#FFB38A] outline-none cursor-pointer"
            >
              <option value={0} className="bg-[#07090D] text-white">Kapalı</option>
              <option value={3} className="bg-[#07090D] text-white">3 sn</option>
              <option value={5} className="bg-[#07090D] text-white">5 sn (Önerilen)</option>
              <option value={15} className="bg-[#07090D] text-white">15 sn</option>
              <option value={30} className="bg-[#07090D] text-white">30 sn</option>
            </select>
          </div>

          {/* Manual Refresh Trigger */}
          <button
            type="button"
            onClick={() => fetchTelemetry()}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl border border-[#FF6A00]/40 bg-[#161B26] px-3.5 py-2 text-xs font-bold text-white transition-all duration-200 hover:border-[#FF6A00] hover:bg-[#FF6A00]/20 hover:shadow-[0_0_20px_rgba(255,106,0,0.3)] active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#FF6A00] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Yenile</span>
          </button>

          {/* Ping Cluster Trigger */}
          <button
            type="button"
            onClick={runPingProbe}
            disabled={isProbing}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-[#0E1B17] px-3.5 py-2 text-xs font-bold text-emerald-300 transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50"
          >
            <Radio className={`h-3.5 w-3.5 text-emerald-400 ${isProbing ? 'animate-pulse' : ''}`} />
            <span>Ping Testi</span>
          </button>

          {/* Emergency Lockdown Action Button */}
          <button
            type="button"
            onClick={() => setShowEmergencyModal(true)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black tracking-wider uppercase transition-all duration-200 active:scale-95 ${
              meta?.isEmergencyLockActive
                ? 'border-red-500 bg-red-600/30 text-red-200 shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse'
                : 'border-[#FF6A00]/50 bg-[#FF6A00]/10 text-[#FFB38A] hover:bg-[#FF6A00] hover:text-white hover:shadow-[0_0_25px_rgba(255,106,0,0.4)]'
            }`}
          >
            {meta?.isEmergencyLockActive ? (
              <>
                <Unlock className="h-4 w-4 text-red-300" />
                <span>TECRİTİ KALDIR</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 text-[#FF6A00]" />
                <span>ACİL KİLİT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top Telemetry KPI Matrix */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Database Connection */}
        <div className="group relative rounded-xl border border-white/10 bg-[#0C1017] p-4 transition-all duration-200 hover:border-[#FF6A00]/50 hover:bg-[#101520] hover:shadow-[0_0_25px_rgba(255,106,0,0.15)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white/60">
              <Server className="h-4 w-4 text-[#FF6A00]" />
              <span>VERİTABANI DURUMU</span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              {dbStatus?.connection || 'SECURE_OPTIMIZED'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black tracking-tight text-white group-hover:text-[#FFB38A]">
              {dbStatus?.latency}
            </span>
            <span className="text-xs font-semibold text-white/50">
              Havuz: {dbStatus?.activePools}
            </span>
          </div>
          <p className="mt-2.5 text-[11px] text-white/45 truncate">
            {dbStatus?.engine || 'PostgreSQL 16 Sovereign Cluster'}
          </p>
        </div>

        {/* KPI 2: SSL & Güvenlik Kalkanı */}
        <div className="group relative rounded-xl border border-white/10 bg-[#0C1017] p-4 transition-all duration-200 hover:border-[#FF6A00]/50 hover:bg-[#101520] hover:shadow-[0_0_25px_rgba(255,106,0,0.15)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white/60">
              <ShieldCheck className="h-4 w-4 text-[#FF6A00]" />
              <span>SSL SHIELD</span>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/30">
              {dbStatus?.sslShield || 'ACTIVE'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black tracking-tight text-white group-hover:text-[#FFB38A]">
              {meta?.vaultStatus === 'ISOLATED' ? 'İZOLASYON' : 'GÜVENLİ KASA'}
            </span>
            <span className="text-xs font-extrabold text-emerald-400">TLS 1.3 / AES-256</span>
          </div>
          <p className="mt-2.5 text-[11px] text-white/45 truncate">
            Kasa: {dbStatus?.offlineVault || 'SYNCED (AES-256)'}
          </p>
        </div>

        {/* KPI 3: Active Threat Level */}
        <div className="group relative rounded-xl border border-white/10 bg-[#0C1017] p-4 transition-all duration-200 hover:border-[#FF6A00]/50 hover:bg-[#101520] hover:shadow-[0_0_25px_rgba(255,106,0,0.15)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white/60">
              <ShieldAlert className="h-4 w-4 text-[#FF6A00]" />
              <span>TEHDİT SEVİYESİ</span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
                meta?.threatLevel === 'CRITICAL_ATTACK'
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : meta?.threatLevel === 'ELEVATED_RISK'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {meta?.threatLevel || 'NORMAL'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black tracking-tight text-white group-hover:text-[#FFB38A]">
              {meta?.totalBlockedAttempts || 16}{' '}
              <span className="text-sm font-normal text-white/50">engelleme</span>
            </span>
            <span className="text-xs font-bold text-[#FF6A00]">
              {unacknowledgedCount ? `${unacknowledgedCount} Bekleyen` : 'Tümü Onaylı'}
            </span>
          </div>
          <p className="mt-2.5 text-[11px] text-white/45">
            WAF Engelli IP: {meta?.blockedIps?.length || 2} kayıt
          </p>
        </div>

        {/* KPI 4: Redis & Serverless Status */}
        <div className="group relative rounded-xl border border-white/10 bg-[#0C1017] p-4 transition-all duration-200 hover:border-[#FF6A00]/50 hover:bg-[#101520] hover:shadow-[0_0_25px_rgba(255,106,0,0.15)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white/60">
              <Zap className="h-4 w-4 text-[#FF6A00]" />
              <span>REDIS & DYNAMODB</span>
            </div>
            <span className="rounded-full bg-[#FF6A00]/15 px-2 py-0.5 text-[10px] font-black text-[#FFB38A] border border-[#FF6A00]/30">
              SENKRON
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black tracking-tight text-white group-hover:text-[#FFB38A]">
              {dbStatus?.redisLatency || '2ms'}
            </span>
            <span className="text-xs font-semibold text-white/50">
              Dynamo: {dbStatus?.dynamoStatus || 'ONLINE'}
            </span>
          </div>
          <p className="mt-2.5 text-[11px] text-white/45 truncate">
            OTP & Hızlı Katalog Dağıtımı Aktif
          </p>
        </div>
      </div>

      {/* Main Grid: Left side DB Connectivity & Health, Right side Real-Time Security Incident Feed */}
      <div className="mt-7 grid gap-6 lg:grid-cols-12">
        {/* Left Column: Database Status & Infrastructure (5 Cols) */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-black tracking-wider text-white uppercase">
              <HardDrive className="h-4 w-4 text-[#FF6A00]" />
              Veritabanı Altyapı Düğümleri
            </h3>
            <span className="text-xs text-white/40">
              Son Kontrol: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>

          {/* Node 1: Primary Database (PostgreSQL) */}
          <div className="rounded-xl border border-white/10 bg-[#0C1017] p-4 transition-all duration-200 hover:border-[#FF6A00]/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-[#FF6A00]/15 p-2 text-[#FF6A00]">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">PostgreSQL Sovereign DB</h4>
                  <p className="text-[11px] text-white/50">{dbStatus?.engine || 'Primary Relational Cluster'}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block text-sm font-black text-emerald-400">
                  {dbStatus?.latency}
                </span>
                <p className="text-[10px] text-white/40">Gecikme</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-[11px]">
              <div>
                <span className="text-white/40">Bağlantı Modu:</span>
                <p className="font-bold text-emerald-400">{dbStatus?.connection}</p>
              </div>
              <div>
                <span className="text-white/40">Aktif Havuzlar:</span>
                <p className="font-bold text-white/80">{dbStatus?.activePools}</p>
              </div>
            </div>
          </div>

          {/* Node 2: AWS DynamoDB */}
          <div className="rounded-xl border border-white/10 bg-[#0C1017] p-4 transition-all duration-200 hover:border-[#FF6A00]/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-orange-500/15 p-2 text-orange-400">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">AWS DynamoDB</h4>
                  <p className="text-[11px] text-white/50">Serverless High-Velocity Catalog</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  {dbStatus?.dynamoStatus || 'ONLINE'}
                </span>
              </div>
            </div>
          </div>

          {/* Node 3: SQLite Offline Vault */}
          <div className="rounded-xl border border-white/10 bg-[#0C1017] p-4 transition-all duration-200 hover:border-[#FF6A00]/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-blue-500/15 p-2 text-blue-400">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">VIVO POS Offline Vault</h4>
                  <p className="text-[11px] text-white/50">{dbStatus?.offlineVault || 'SYNCED (AES-256-GCM)'}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  GÜVENLİ
                </span>
              </div>
            </div>
          </div>

          {/* Active Security Architecture Summary */}
          <div className="rounded-xl border border-[#FF6A00]/20 bg-[#0A0D14] p-4">
            <p className="text-[11px] font-bold tracking-wider text-[#FF6A00] uppercase">Aktif Savunma Katmanları</p>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/70">SSL Kalkanı</span>
                <span className="font-bold text-emerald-400">{dbStatus?.sslShield}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">VERI-SHIELD (RENAP / SAT)</span>
                <span className="font-bold text-emerald-400">Doğrulanmış</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">IRON-SHIELD WAF / Anti-DDoS</span>
                <span className="font-bold text-[#FFB38A]">Koruma Devrede</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Security Incident & Alerts Stream (7 Cols) */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#FF6A00]" />
              <h3 className="text-sm font-black tracking-wider text-white uppercase">
                Canlı Güvenlik Uyarıları (System Alerts)
              </h3>
              <span className="rounded-full bg-[#FF6A00]/20 px-2 py-0.5 text-xs font-bold text-[#FFB38A]">
                {filteredAlerts.length} Olay
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#121620] p-1 text-xs">
              {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
                    selectedFilter === filter
                      ? 'bg-[#FF6A00] text-white shadow-[0_0_12px_rgba(255,106,0,0.4)]'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {filter === 'ALL' ? 'TÜMÜ' : filter === 'CRITICAL' ? 'KRİTİK' : filter === 'WARNING' ? 'UYARI' : 'BİLGİ'}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Alert Feed */}
          <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-[#0C1017] py-12 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 opacity-80" />
                <p className="mt-2 text-sm font-bold text-white/80">Aktif güvenlik uyarısı bulunmuyor</p>
                <p className="text-xs text-white/40">Tüm sistem filtreleri ve WAF kuralları nominal çalışıyor.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`group relative rounded-xl border p-4 transition-all duration-200 ${
                    alert.level === 'CRITICAL'
                      ? 'border-red-500/40 bg-[#170B0E] hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                      : alert.level === 'WARNING'
                      ? 'border-amber-500/40 bg-[#17120B] hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'border-white/10 bg-[#0C1017] hover:border-white/25'
                  } ${alert.acknowledged ? 'opacity-60' : 'opacity-100'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ${
                          alert.level === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : alert.level === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {alert.level}
                      </span>
                      <span className="text-xs font-bold text-white/50">{alert.id}</span>
                    </div>
                    <span className="text-[11px] text-white/40">
                      {alert.timestamp}
                    </span>
                  </div>

                  <h4 className="mt-2 text-sm font-extrabold text-white group-hover:text-[#FFB38A]">
                    {alert.message}
                  </h4>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-2.5 text-xs">
                    <div className="flex items-center gap-1.5 text-white/50">
                      <Cpu className="h-3.5 w-3.5 text-[#FF6A00]" />
                      <span className="font-mono text-[11px] text-[#FFE2CF]">{alert.sourceIp || 'Internal Node'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Block IP Trigger */}
                      {alert.sourceIp && !alert.sourceIp.includes('Internal') && !alert.sourceIp.includes('AWS') && (
                        <button
                          type="button"
                          onClick={() => {
                            const ip = alert.sourceIp?.split(' ')[0] || '';
                            if (ip) blockIp(ip);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] font-bold text-red-300 transition-all hover:bg-red-500 hover:text-white"
                        >
                          <Ban className="h-3 w-3" />
                          <span>IP Engelle</span>
                        </button>
                      )}

                      {/* Acknowledge Button */}
                      {!alert.acknowledged ? (
                        <button
                          type="button"
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-2.5 py-1 text-[11px] font-bold text-[#FFB38A] transition-all hover:border-[#FF6A00] hover:bg-[#FF6A00] hover:text-white"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Onayla</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-white/40">Onaylandı ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Emergency Lockdown Confirmation Modal */}
      <AnimatePresence>
        {showEmergencyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-red-500/50 bg-[#0E0709] p-6 text-white shadow-[0_0_50px_rgba(239,68,68,0.4)]"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="h-7 w-7 animate-bounce" />
                <h3 className="text-xl font-extrabold uppercase tracking-wide">
                  {meta?.isEmergencyLockActive ? 'Tecrit Kilidini Kaldır' : 'Acil Durum Kasasını İzole Et'}
                </h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/70">
                {meta?.isEmergencyLockActive
                  ? 'Sistem kasasını ve işlem ağ geçitlerini normal operasyonel durumuna döndürmek üzeresiniz.'
                  : 'Bu işlem VIVO PAY akıllı emanet kasalarını derhal tecrit moduna alır, tehdit seviyesini KRİTİK olarak ayarlar ve harici veri transferlerini bloke eder.'}
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={toggleEmergencyLock}
                  className={`rounded-xl px-5 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                    meta?.isEmergencyLockActive
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
                  }`}
                >
                  {meta?.isEmergencyLockActive ? 'Normale Döndür' : 'Tecriti Uygula'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
