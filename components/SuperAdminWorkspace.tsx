'use client';

import { useState } from 'react';
import { Activity, BadgeCheck, Box, CreditCard, ShieldAlert, Truck, Users } from 'lucide-react';

const views = [
  ['Overview', Activity, 'Live operating picture across public services.'],
  ['Marketplace', Box, 'Review listings, catalog quality, and buyer flows.'],
  ['Sellers', Users, 'Verify seller readiness and storefront policy.'],
  ['Cargo', Truck, 'Monitor shipments, exceptions, and delivery proof.'],
  ['Payments', CreditCard, 'Review escrow, settlement, and payout gates.'],
  ['Trust', BadgeCheck, 'Queue identity, fraud, and compliance evidence.'],
  ['Security', ShieldAlert, 'Security alerts and release controls.']
] as const;

export function SuperAdminWorkspace() {
  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState('');
  const [items, setItems] = useState(['Listing quality queue', 'Seller verification queue', 'Escrow settlement review']);
  const [name, Icon, description] = views[active];
  const resolve = (item: string) => { setItems((current) => current.filter((entry) => entry !== item)); setNotice(`${item} marked reviewed. This preview does not execute external actions.`); };
  return <main className="vivo-public-shell min-h-screen p-4 text-white sm:p-6"><div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[220px_1fr]"><aside className="vivo-glass-panel rounded-xl p-4"><p className="text-xs font-bold tracking-[.16em] text-[#FF6A00]">VIVO AMIGO</p><h1 className="mt-2 text-xl font-extrabold">Super Admin</h1><nav className="mt-6 space-y-1" aria-label="Admin sections">{views.map(([label, ViewIcon], index) => <button key={label} type="button" onClick={() => setActive(index)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-xs font-bold ${active === index ? 'bg-[#FF6A00] text-white' : 'text-white/65 hover:bg-white/[.06] hover:text-white'}`}><ViewIcon size={16} />{label}</button>)}</nav></aside><section><header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5"><div><p className="text-xs font-bold tracking-[.16em] text-[#FF6A00]">RESTRICTED OPERATIONS</p><h2 className="mt-2 flex items-center gap-3 text-3xl font-extrabold"><Icon className="text-[#FF6A00]" />{name}</h2><p className="mt-2 text-sm text-white/60">{description}</p></div><span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-bold text-emerald-200">Session protected</span></header>{notice && <p role="status" className="mt-5 rounded-lg border border-[#FF6A00]/30 bg-[#FF6A00]/10 p-3 text-sm text-[#FFE2CF]">{notice}</p>}<div className="mt-5 grid gap-4 sm:grid-cols-3">{[['Marketplace health', 'Preview'], ['Critical actions', 'Guarded'], ['Agent coverage', '250 ready']].map(([label, value]) => <article key={label} className="vivo-glass-panel rounded-xl p-5"><p className="text-xs text-white/55">{label}</p><strong className="mt-3 block text-xl font-extrabold text-[#FFB38A]">{value}</strong></article>)}</div><section className="vivo-glass-panel mt-5 rounded-xl p-5"><h3 className="text-lg font-extrabold">Review queue</h3><div className="mt-4 space-y-3">{items.map((item) => <div key={item} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/15 p-4"><span className="text-sm font-semibold">{item}</span><button type="button" onClick={() => resolve(item)} className="rounded-lg border border-[#FF6A00]/40 px-3 py-2 text-xs font-bold text-[#FFB38A]">Mark reviewed</button></div>)}{items.length === 0 && <p className="py-6 text-sm text-white/55">No pending local preview items.</p>}</div></section></section></div></main>;
}
