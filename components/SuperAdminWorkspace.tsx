'use client';

import { useState } from 'react';
import { Activity, BadgeCheck, Ban, Box, CreditCard, MapPin, PackageCheck, ShieldAlert, Store, Truck, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { SuperAdminDatabaseSecurityWidget } from './admin/SuperAdminDatabaseSecurityWidget';
import SecurityAlertsWidget from './SecurityAlertsWidget';

type Tab = 'Overview' | 'Marketplace' | 'Sellers' | 'Post' | 'Payments' | 'Trust' | 'Security';
const spring = { type: 'spring' as const, stiffness: 420, damping: 30 };
const tabs: { label: Tab; icon: typeof Activity; description: string }[] = [
  { label: 'Overview', icon: Activity, description: 'System telemetry and operating summary.' },
  { label: 'Marketplace', icon: Box, description: 'Listings, approval queues, and categories.' },
  { label: 'Sellers', icon: Users, description: 'Seller stores, applications, and readiness.' },
  { label: 'Post', icon: Truck, description: 'CARGO VIVO shipments and courier operations.' },
  { label: 'Payments', icon: CreditCard, description: 'VIVO PAY history, rates, and wallet gates.' },
  { label: 'Trust', icon: BadgeCheck, description: 'Verification, reports, and trust signals.' },
  { label: 'Security', icon: ShieldAlert, description: 'Access logs, blocks, and security settings.' }
];

export function SuperAdminWorkspace() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [notice, setNotice] = useState('');
  const [blockedIps, setBlockedIps] = useState<string[]>([]);
  const [pending, setPending] = useState(['MacBook Pro M3 listing', 'Café Antigua seller verification', 'Escrow settlement review']);
  const active = tabs.find((tab) => tab.label === activeTab) || tabs[0];
  const resolve = (item: string) => { setPending((current) => current.filter((entry) => entry !== item)); setNotice(`${item} marked reviewed in this admin preview.`); };
  const blockIp = () => { const value = window.prompt('IP address to block'); if (value?.trim()) { setBlockedIps((current) => [...current, value.trim()]); setNotice(`${value.trim()} added to the local block list.`); } };
  return <main className="vivo-public-shell min-h-screen p-4 text-white sm:p-6"><div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[220px_1fr]">
    <aside className="vivo-glass-panel rounded-xl p-4"><p className="text-xs font-bold tracking-[.16em] text-[#FF6A00]">VIVO AMIGO</p><h1 className="mt-2 text-xl font-extrabold">Super Admin</h1><nav className="mt-6 space-y-1" aria-label="Admin sections">{tabs.map(({ label, icon: Icon }) => <button key={label} type="button" onClick={() => setActiveTab(label)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-xs font-bold transition ${activeTab === label ? 'bg-[#FF6A00] text-white shadow-[0_10px_30px_rgba(255,106,0,.22)]' : 'text-white/65 hover:bg-white/[.06] hover:text-white'}`}><Icon size={16} />{label}</button>)}</nav></aside>
    <section><header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5"><div><p className="text-xs font-bold tracking-[.16em] text-[#FF6A00]">COMMAND CENTER</p><h2 className="mt-2 flex items-center gap-3 text-3xl font-extrabold"><active.icon className="text-[#FF6A00]" />{active.label}</h2><p className="mt-2 text-sm text-white/60">{active.description}</p></div><span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-bold text-emerald-200">Session protected</span></header>{notice && <p role="status" className="mt-5 rounded-lg border border-[#FF6A00]/30 bg-[#FF6A00]/10 p-3 text-sm text-[#FFE2CF]">{notice}</p>}<AnimatePresence mode="wait"><motion.div key={activeTab} initial={{ opacity: 0, y: 8, scale: .99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: .99 }} transition={spring} className="mt-5"><Panel tab={activeTab} pending={pending} onResolve={resolve} blockedIps={blockedIps} onBlockIp={blockIp} /></motion.div></AnimatePresence></section>
  </div></main>;
}

function Panel({ tab, pending, onResolve, blockedIps, onBlockIp }: { tab: Tab; pending: string[]; onResolve: (item: string) => void; blockedIps: string[]; onBlockIp: () => void }) {
  if (tab === 'Overview') return <><SuperAdminDatabaseSecurityWidget /><Metrics values={[['System telemetry', 'Operational'], ['Agent monitoring', '250 ready'], ['Open reviews', String(pending.length)]]} /><Queue items={pending} onResolve={onResolve} /></>;
  if (tab === 'Marketplace') return <><Metrics values={[['Active listings', '128'], ['Pending approval', '12'], ['Categories', '7']]} /><List title="Approval queue" rows={['MacBook Pro M3 · Electronics', 'Casa Zona 14 · Real estate', 'Restaurant cook · Jobs']} action="Approve" /></>;
  if (tab === 'Sellers') return <><Metrics values={[['Verified stores', '34'], ['New applications', '7'], ['Catalog issues', '2']]} /><List title="Seller applications" rows={['Café Antigua · Ready for review', 'Tecno GT · Documents pending', 'Mercado Verde · Verified']} action="Review" /></>;
  if (tab === 'Post') return <><Metrics values={[['In transit', '14'], ['Delivery exceptions', '2'], ['Couriers online', '38']]} /><List title="CARGO VIVO shipments" rows={['CV-2026-1048 · Guatemala City to Antigua', 'CV-2026-1047 · Delivered', 'CV-2026-1046 · Pickup scheduled']} action="Open shipment" /></>;
  if (tab === 'Payments') return <><Metrics values={[['Escrow holds', 'Q 42,860'], ['Settlement review', '5'], ['Commission rate', '3.5%']]} /><List title="VIVO PAY review" rows={['Escrow #VA-10582 · Held', 'Payout #PO-281 · Pending review', 'Wallet transfer · Preview only']} action="View gate" /></>;
  if (tab === 'Trust') return <><Metrics values={[['Trust score average', '96/100'], ['Identity reviews', '9'], ['Open reports', '3']]} /><List title="Verification queue" rows={['Seller KYC · Documents received', 'Vehicle inspection · Pending', 'Buyer report · Evidence review']} action="Review" /></>;
  return <><div className="mb-6"><SecurityAlertsWidget /></div><SuperAdminDatabaseSecurityWidget /><Metrics values={[['Blocked IPs', String(blockedIps.length)], ['Security alerts', '0'], ['Last audit', 'Just now']]} /><section className="vivo-glass-panel mt-5 rounded-xl p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-extrabold">Access controls</h3><p className="mt-1 text-sm text-white/55">Local preview block list. Server enforcement requires a security provider.</p></div><button type="button" onClick={onBlockIp} className="inline-flex items-center gap-2 rounded-lg border border-red-300/35 px-3 py-2 text-xs font-bold text-red-200"><Ban size={15} />Block IP</button></div><div className="mt-4 space-y-2">{blockedIps.length ? blockedIps.map((ip) => <p key={ip} className="rounded-lg border border-white/10 bg-black/15 p-3 text-sm">{ip}</p>) : <p className="rounded-lg border border-white/10 bg-black/15 p-3 text-sm text-white/55">No local IP blocks configured.</p>}</div></section></>;
}

function Metrics({ values }: { values: string[][] }) { return <section className="grid gap-4 sm:grid-cols-3">{values.map(([label, value]) => <article key={label} className="vivo-glass-panel rounded-xl p-5"><p className="text-xs text-white/55">{label}</p><strong className="mt-3 block text-xl font-extrabold text-[#FFB38A]">{value}</strong></article>)}</section>; }
function Queue({ items, onResolve }: { items: string[]; onResolve: (item: string) => void }) { return <section className="vivo-glass-panel mt-5 rounded-xl p-5"><h3 className="text-lg font-extrabold">Recent operations</h3><div className="mt-4 space-y-3">{items.length ? items.map((item) => <div key={item} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/15 p-4"><span className="text-sm font-semibold">{item}</span><button type="button" onClick={() => onResolve(item)} className="rounded-lg border border-[#FF6A00]/40 px-3 py-2 text-xs font-bold text-[#FFB38A]">Mark reviewed</button></div>) : <p className="py-6 text-sm text-white/55">No pending preview reviews.</p>}</div></section>; }
function List({ title, rows, action }: { title: string; rows: string[]; action: string }) { return <section className="vivo-glass-panel mt-5 rounded-xl p-5"><h3 className="text-lg font-extrabold">{title}</h3><div className="mt-4 space-y-3">{rows.map((row) => <div key={row} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/15 p-4"><span className="text-sm font-semibold">{row}</span><button type="button" onClick={() => window.alert(`${action}: ${row}. This action is recorded as a local preview.`)} className="rounded-lg border border-[#FF6A00]/40 px-3 py-2 text-xs font-bold text-[#FFB38A]">{action}</button></div>)}</div></section>; }
