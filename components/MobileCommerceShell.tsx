'use client';

import React, { useState } from 'react';
import { LiveCurrencyWidget } from './LiveCurrencyWidget';
import { ReturnGreeting } from './ReturnGreeting';
import { CorporateBillboard } from './CorporateBillboard';
import { AdServerEngine } from '../services/adServerEngine';
import { TrustBar } from './TrustBar';
import { InsuranceShieldBadge } from './InsuranceShieldBadge';

type Language = 'es' | 'en';
type Tab = 'home' | 'search' | 'post' | 'wallet' | 'profile';

const listings = [
  { title: 'Toyota Hilux 2022', category: 'VEHICLES', price: 'Q 215,000', seller: 'Auto Centro', mark: 'H', trusted: true },
  { title: 'Casa en Zona 14', category: 'REAL_ESTATE', price: '$ 320,000', seller: 'Casa Norte', mark: 'C', trusted: true },
  { title: 'MacBook Pro M3', category: 'ELECTRONICS', price: 'Q 14,500', seller: 'Tech GT', mark: 'M', trusted: false }
];

const copy = {
  es: { home: 'Inicio', search: 'Buscar', post: 'Publicar', wallet: 'Wallet', profile: 'Perfil', title: 'Todo lo que mueve a Guatemala.', subtitle: 'Compra, vende y protege cada operación.', explore: 'Explorar verificados', balance: 'Saldo PayVivo', escrow: 'Escrow retenido', publish: 'Publicar en 3 pasos', security: 'VIVO-CHECK activo', biometric: 'Touch-ID / Face-ID listo', verified: 'Vendedor confiable' },
  en: { home: 'Home', search: 'Search', post: 'Post', wallet: 'Wallet', profile: 'Profile', title: 'Everything that moves Guatemala.', subtitle: 'Buy, sell, and protect every transaction.', explore: 'Explore verified', balance: 'PayVivo balance', escrow: 'Escrow held', publish: 'Post in 3 steps', security: 'VIVO-CHECK active', biometric: 'Touch-ID / Face-ID ready', verified: 'Trusted seller' }
};

export const MobileCommerceShell = () => {
  const [language, setLanguage] = useState<Language>('es');
  const [tab, setTab] = useState<Tab>('home');
  const [postStep, setPostStep] = useState(1);
  const t = copy[language];
  const homeOffer = new AdServerEngine().getContextualAd('VEHICLES');

  return <main className="min-h-screen bg-[#F8F9FA] pb-24 text-[#111111] md:pb-8">
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/90 px-4 py-3 backdrop-blur-xl"><div className="mx-auto flex max-w-5xl items-center justify-between"><a href="/" className="flex items-center gap-2 font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FF6A00] text-white">V</span>vivoamigo</a><div className="flex items-center gap-2"><button type="button" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} className="rounded-full border border-black/10 px-3 py-1 text-xs font-bold">{language.toUpperCase()} / {language === 'es' ? 'EN' : 'ES'}</button><a href="https://payvivoamigo.com" target="_blank" rel="noreferrer" className="rounded-full bg-[#111111] px-3 py-1.5 text-xs font-bold text-white">PAY VIVO</a></div></div></header>
    <div className="mx-auto max-w-5xl px-4">
      {tab === 'home' && <><ReturnGreeting /><CorporateBillboard {...homeOffer} targetCategory="VEHICLES" /><section className="mt-5 rounded-3xl bg-[#111111] p-6 text-white shadow-xl"><span className="rounded-full bg-[#16A34A] px-2 py-1 text-[10px] font-extrabold uppercase">{t.security}</span><h1 className="mt-5 text-4xl font-extrabold leading-tight">{t.title}</h1><p className="mt-3 max-w-md text-sm text-white/60">{t.subtitle} <strong className="text-[#FF6A00]">Llevamos Vidas.</strong></p><button type="button" onClick={() => setTab('search')} className="mt-6 rounded-full bg-[#FF6A00] px-5 py-3 text-sm font-extrabold text-white">{t.explore} →</button></section><section className="mt-6"><div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-extrabold">{language === 'es' ? 'Oportunidades destacadas' : 'Featured opportunities'}</h2><span className="text-xs font-bold text-black/40">3</span></div><div className="grid gap-3 sm:grid-cols-3">{listings.map((listing) => <ListingCard key={listing.title} listing={listing} trustedLabel={t.verified} />)}</div></section></>}
      {tab === 'search' && <section className="py-6"><h1 className="text-3xl font-extrabold">{t.search}</h1><input className="mt-4 w-full rounded-2xl border border-black/10 bg-white px-4 py-4 outline-none focus:border-[#FF6A00]" placeholder={language === 'es' ? 'Busca vehículos, inmuebles o tecnología' : 'Search vehicles, real estate, or tech'} /> <div className="mt-5 grid gap-3 sm:grid-cols-3">{listings.map((listing) => <ListingCard key={listing.title} listing={listing} trustedLabel={t.verified} />)}</div></section>}
      {tab === 'post' && <section className="py-6"><h1 className="text-3xl font-extrabold">{t.publish}</h1><div className="mt-5 grid grid-cols-3 gap-2">{['Asset', 'Details', 'Publish'].map((step, index) => <div key={step} className={`rounded-xl p-3 text-center text-xs font-bold ${postStep === index + 1 ? 'bg-[#FF6A00] text-white' : 'bg-white text-black/40'}`}>{index + 1}. {language === 'es' ? ['Activo', 'Detalles', 'Publicar'][index] : step}</div>)}</div><div className="mt-5 rounded-3xl bg-white p-6 shadow-sm"><p className="text-sm font-bold">{language === 'es' ? 'Categoría del activo' : 'Asset category'}</p><div className="mt-4 grid grid-cols-3 gap-2">{['Electronics', 'Vehicles', 'Real Estate'].map((item) => <button type="button" key={item} className="rounded-xl border border-black/10 p-4 text-xs font-bold hover:border-[#FF6A00]">{item}</button>)}</div><button type="button" onClick={() => setPostStep(Math.min(3, postStep + 1))} className="mt-6 w-full rounded-full bg-[#111111] py-3 text-sm font-extrabold text-white">{postStep === 3 ? 'Enviar a VERI-SHIELD' : 'Continuar →'}</button></div></section>}
      {tab === 'wallet' && <section className="py-6"><h1 className="text-3xl font-extrabold">PAY VIVO</h1><TrustBar assetClass="RETAIL" amountGTQ={3200} /><InsuranceShieldBadge partnerName="Seguros El Roble · partner terms required" insuredValueGTQ={3200} /><div className="mt-5 rounded-3xl bg-[#111111] p-6 text-white"><p className="text-xs text-white/50">{t.balance}</p><strong className="mt-2 block text-4xl text-[#FF6B00]">Q 12,500.00</strong><p className="mt-2 text-xs text-white/60">{t.escrow}: Q 3,200.00</p><button type="button" className="mt-6 w-full rounded-full bg-[#FF6B00] py-3 text-sm font-extrabold">{t.biometric}</button></div><div className="mt-4"><LiveCurrencyWidget /></div><div className="mt-4 rounded-2xl bg-white p-5"><h2 className="font-extrabold">{language === 'es' ? 'Transacciones verificadas' : 'Verified transactions'}</h2><p className="mt-3 text-sm text-[#16A34A]">✓ VIVO-CHECK · Toyota Hilux · Q 2,500</p><p className="mt-2 text-sm text-[#16A34A]">✓ CARGO VIVO · Delivery · Q 180</p></div></section>}
      {tab === 'profile' && <section className="py-6"><h1 className="text-3xl font-extrabold">{t.profile}</h1><div className="mt-5 rounded-3xl bg-white p-6"><div className="grid h-14 w-14 place-items-center rounded-full bg-[#FF6A00] text-xl font-extrabold text-white">SA</div><h2 className="mt-4 text-xl font-extrabold">Seller account</h2><p className="mt-1 text-sm text-black/50">{t.verified}</p><span className="mt-5 inline-flex rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-bold text-[#166534]">VERI-SHIELD verified</span></div></section>}
    </div>
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/10 bg-white/95 px-2 py-2 backdrop-blur-xl md:static md:mx-auto md:mt-8 md:max-w-5xl md:rounded-2xl md:border" aria-label="Primary navigation"> <div className="mx-auto grid max-w-md grid-cols-5">{(['home', 'search', 'post', 'wallet', 'profile'] as Tab[]).map((item) => <button type="button" key={item} onClick={() => setTab(item)} className={`rounded-xl px-2 py-2 text-[10px] font-extrabold ${tab === item ? 'bg-[#FFF1E8] text-[#EB5C00]' : 'text-black/45'}`}>{t[item]}</button>)}</div></nav>
  </main>;
};

function ListingCard({ listing, trustedLabel }: { listing: typeof listings[number]; trustedLabel: string }) {
  return <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"><div className="grid h-32 place-items-center rounded-xl bg-[#FFF7F1] text-4xl font-extrabold text-[#FF6A00]">{listing.mark}</div><p className="mt-3 text-[10px] font-bold uppercase text-black/40">{listing.category}</p><h3 className="mt-1 font-extrabold">{listing.title}</h3><p className="mt-2 text-lg font-extrabold">{listing.price}</p>{listing.trusted && <span className="mt-3 inline-flex rounded-full bg-[#DCFCE7] px-2 py-1 text-[10px] font-bold text-[#166534]">✓ {trustedLabel}</span>}</article>;
}