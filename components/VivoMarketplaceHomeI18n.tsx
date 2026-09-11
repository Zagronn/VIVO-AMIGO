'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BriefcaseBusiness, Building2, CarFront, Heart, Home, Laptop, MapPin, Menu, Search, ShoppingBag, SlidersHorizontal, Store, Wheat, Wrench, X } from 'lucide-react';
import { VivoBrandLogo } from './VivoBrandLogo';

const copy = { all: 'All', electronics: 'Electronics', automotive: 'Automotive', home: 'Home', agriculture: 'Agriculture', jobs: 'Jobs', realEstate: 'Real estate', services: 'Services', saved: 'Saved to favorites', added: 'Saved to preview cart. Transactions open soon.', smartSearch: 'Search products, jobs, services or properties', search: 'Search', cart: 'Cart', marketplace: 'Marketplace', quickView: 'Quick view', addCart: 'Add to cart', noResults: 'No products found.', close: 'Close', business: 'VIVO BUSINESS' };

const products = [
  { name: 'MacBook Pro M3', category: 'Electronics', price: 'Q 14,500', image: '/images/catalog/laptop.jpg', tone: 'violet' },
  { name: 'Toyota Hilux 2022', category: 'Automotive', price: 'Q 215,000', image: '/images/catalog/vehicle.jpg', tone: 'blue' },
  { name: 'Cafe de altura 500g', category: 'Agriculture', price: 'Q 18.00', image: '/images/catalog/coffee.jpg', tone: 'green' },
  { name: 'Casa en Zona 14', category: 'Real estate', price: 'Q 2,500,000', image: '/images/catalog/home.jpg', tone: 'orange' },
  { name: 'Restaurant cook', category: 'Jobs', price: 'Q 4,500 / month', image: '/images/catalog/chef.jpg', tone: 'orange' },
  { name: 'Plumbing and repairs', category: 'Services', price: 'From Q 150', image: '/images/catalog/service.jpg', tone: 'green' }
];

const categoryCards = [
  { key: 'Electronics', label: copy.electronics, icon: Laptop, hint: '100 products to compare', accent: 'text-violet-300 bg-violet-400/10 border-violet-300/20' },
  { key: 'Automotive', label: copy.automotive, icon: CarFront, hint: 'Vehicles and mobility', accent: 'text-blue-300 bg-blue-400/10 border-blue-300/20' },
  { key: 'Real estate', label: copy.realEstate, icon: Building2, hint: 'Homes and spaces', accent: 'text-[#FFB38A] bg-[#FF6A00]/10 border-[#FF6A00]/25' },
  { key: 'Jobs', label: copy.jobs, icon: BriefcaseBusiness, hint: 'Roles near you', accent: 'text-[#FFB38A] bg-[#FF6A00]/10 border-[#FF6A00]/25' },
  { key: 'Services', label: copy.services, icon: Wrench, hint: 'Local specialists', accent: 'text-emerald-300 bg-emerald-400/10 border-emerald-300/20' },
  { key: 'Agriculture', label: copy.agriculture, icon: Wheat, hint: 'Direct from producers', accent: 'text-emerald-300 bg-emerald-400/10 border-emerald-300/20' }
];

const categorySlug = (category: string) => category.toLowerCase().replaceAll(' ', '-');
const spring = { type: 'spring' as const, stiffness: 420, damping: 30 };

type Product = (typeof products)[number];

export function VivoMarketplaceHomeI18n() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const [quickView, setQuickView] = useState<Product | null>(null);

  useEffect(() => {
    const storedCart = window.localStorage.getItem('vivo-amigo-cart');
    const storedFavorites = window.localStorage.getItem('vivo-amigo-favorites');
    if (storedCart) setCart(JSON.parse(storedCart) as string[]);
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites) as string[]);
  }, []);

  const filtered = useMemo(() => products.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    return matchesCategory && `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase());
  }), [category, query]);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
  const toggleFavorite = (name: string) => {
    setFavorites((current) => {
      const next = current.includes(name) ? current.filter((item) => item !== name) : [...current, name];
      window.localStorage.setItem('vivo-amigo-favorites', JSON.stringify(next));
      return next;
    });
    notify(copy.saved);
  };
  const addToCart = (name: string) => {
    setCart((current) => {
      const next = [...current, name];
      window.localStorage.setItem('vivo-amigo-cart', JSON.stringify(next));
      return next;
    });
    notify(copy.added);
  };
  const openCategory = (nextCategory: string) => { setCategory(nextCategory); router.push(`/categories/${categorySlug(nextCategory)}`); };

  return <main className="vivo-public-shell min-h-screen pb-28 text-white lg:pb-12">
    <header className="vivo-public-header sticky top-0 z-30 border-b px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3"><VivoBrandLogo light />
        <form action="/listings" className="ml-auto hidden max-w-2xl flex-1 overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] md:flex"><Search className="ml-4 text-[#FF6A00]" size={18} /><input name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.smartSearch} aria-label={copy.search} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/35" /><button type="submit" aria-label={copy.search} className="grid w-12 place-items-center bg-[#FF6A00]"><ArrowRight size={18} /></button></form>
        <button type="button" onClick={() => notify('Favorites are saved on this device.')} aria-label="Favorites" className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white/75 hover:border-[#FF6A00]/60"><Heart size={18} />{favorites.length > 0 && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[#FF6A00] text-[9px] text-white">{favorites.length}</span>}</button>
        <Link href="/cart" aria-label={copy.cart} className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white/75 hover:border-[#FF6A00]/60"><ShoppingBag size={18} />{cart.length > 0 && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[#FF6A00] text-[9px] text-white">{cart.length}</span>}</Link><Link href="/business" className="hidden rounded-lg bg-[#FF6A00] px-4 py-2.5 text-xs font-bold text-white sm:block">Sell with VIVO</Link>
      </div>
      <form action="/listings" className="mx-auto mt-3 flex max-w-7xl overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] md:hidden"><Search className="ml-4 text-[#FF6A00]" size={18} /><input name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.smartSearch} aria-label={copy.search} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/35" /><button type="submit" aria-label={copy.search} className="grid w-12 place-items-center bg-[#FF6A00]"><ArrowRight size={18} /></button></form>
    </header>

    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:pt-10"><div className="grid gap-3 lg:grid-cols-12 lg:grid-rows-[260px_132px]">
      <motion.button type="button" onClick={() => openCategory('Real estate')} whileTap={{ scale: .99 }} transition={spring} className="group relative min-h-[260px] overflow-hidden rounded-xl border border-white/10 text-left lg:col-span-7 lg:row-span-2"><img src="/images/catalog/home.jpg" alt="Featured real estate" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" /><div className="relative flex h-full flex-col justify-end p-6 sm:p-8"><span className="mb-auto w-fit rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] font-bold tracking-[.14em] text-white/85">FEATURED COLLECTION</span><p className="text-xs font-bold tracking-[.18em] text-[#FFB38A]">REAL ESTATE</p><h1 className="mt-2 max-w-md text-3xl font-extrabold tracking-tight sm:text-5xl">Find a place that feels like your next move.</h1><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white">Explore spaces <ArrowRight size={16} /></span></div></motion.button>
      <motion.button type="button" onClick={() => openCategory('Electronics')} whileTap={{ scale: .98 }} transition={spring} className="group relative min-h-[180px] overflow-hidden rounded-xl border border-violet-300/20 bg-[#151220] text-left lg:col-span-5"><img src="/images/catalog/laptop.jpg" alt="Electronics collection" className="absolute right-0 top-0 h-full w-3/5 object-cover opacity-80 transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-r from-[#151220] via-[#151220]/85 to-transparent" /><div className="relative p-6"><p className="text-xs font-bold tracking-[.16em] text-violet-300">TECH MARKET</p><h2 className="mt-2 max-w-[11rem] text-2xl font-extrabold tracking-tight">100 electronics to compare.</h2><span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-white">Browse collection <ArrowRight size={15} /></span></div></motion.button>
      <motion.button type="button" onClick={() => openCategory('Jobs')} whileTap={{ scale: .98 }} transition={spring} className="group relative min-h-[132px] overflow-hidden rounded-xl border border-[#FF6A00]/35 bg-[#21150D] text-left lg:col-span-3"><img src="/images/catalog/chef.jpg" alt="Jobs" className="absolute right-0 h-full w-1/2 object-cover opacity-60" /><div className="absolute inset-0 bg-gradient-to-r from-[#21150D] via-[#21150D]/90 to-transparent" /><div className="relative p-5"><p className="text-[10px] font-bold tracking-[.16em] text-[#FFB38A]">JOBS</p><h2 className="mt-1 max-w-[9rem] text-lg font-extrabold">The next role is closer.</h2></div></motion.button>
      <div className="flex min-h-[132px] flex-col justify-between rounded-xl border border-white/10 bg-white/[0.055] p-5 lg:col-span-2"><MapPin size={18} className="text-[#FF6A00]" /><div><p className="text-[10px] font-bold tracking-[.14em] text-white/45">LOCAL FIRST</p><p className="mt-1 text-sm font-bold">Guatemala marketplace</p></div></div>
    </div><nav className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Marketplace categories">{categoryCards.map(({ key, label, icon: Icon, hint, accent }) => <motion.button key={key} type="button" onClick={() => openCategory(key)} whileTap={{ scale: .97 }} transition={spring} className={`flex min-w-[154px] items-center gap-3 rounded-lg border px-3 py-3 text-left transition hover:-translate-y-0.5 ${accent}`}><span className="grid h-8 w-8 place-items-center rounded-md bg-black/15"><Icon size={16} /></span><span><strong className="block text-xs text-white">{label}</strong><small className="block pt-0.5 text-[10px] text-white/50">{hint}</small></span></motion.button>)}</nav></section>

    <section className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 lg:pt-12" aria-live="polite"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.18em] text-[#FF6A00]">LIVE DISCOVERY</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight">Market, curated for right now.</h2></div><div className="flex items-center gap-2"><span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/60">{filtered.length} available</span><button type="button" onClick={() => { setCategory('All'); setQuery(''); }} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/65 hover:border-[#FF6A00]/60" aria-label="Reset filters"><SlidersHorizontal size={16} /></button></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-12">{filtered.map((product, index) => <MarketplaceCard key={product.name} product={product} featured={index === 0} favorite={favorites.includes(product.name)} onFavorite={() => toggleFavorite(product.name)} onAction={() => product.category === 'Jobs' ? notify(`Interest saved for ${product.name}. Applications open soon.`) : addToCart(product.name)} onQuickView={() => setQuickView(product)} />)}</div>{filtered.length === 0 && <div className="mt-6 rounded-xl border border-dashed border-white/15 p-8 text-sm text-white/55">{copy.noResults}</div>}</section>

    <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-white/10 bg-[#07090D]/95 px-2 py-2 backdrop-blur-xl lg:hidden" aria-label="Primary navigation"><Link href="/" className="grid place-items-center gap-1 rounded-lg py-2 text-[10px] font-bold text-[#FF6A00]"><Home size={17} />{copy.marketplace}</Link><Link href="/listings" className="grid place-items-center gap-1 rounded-lg py-2 text-[10px] font-bold text-white/55"><Menu size={17} />Browse</Link><Link href="/cart" className="grid place-items-center gap-1 rounded-lg py-2 text-[10px] font-bold text-white/55"><ShoppingBag size={17} />{copy.cart}</Link><Link href="/business" className="grid place-items-center gap-1 rounded-lg py-2 text-[10px] font-bold text-white/55"><Store size={17} />Sell</Link></nav>

    <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} transition={spring} role="status" className="fixed bottom-24 left-1/2 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border border-[#FF6A00]/30 bg-[#21150D] px-4 py-3 text-center text-xs font-bold text-[#FFE2CF] shadow-2xl lg:bottom-6">{toast}</motion.div>}{quickView && <QuickView product={quickView} favorite={favorites.includes(quickView.name)} onClose={() => setQuickView(null)} onFavorite={() => toggleFavorite(quickView.name)} onAction={() => { if (quickView.category === 'Jobs') notify(`Interest saved for ${quickView.name}. Applications open soon.`); else addToCart(quickView.name); setQuickView(null); }} />}</AnimatePresence>
  </main>;
}

function MarketplaceCard({ product, featured, favorite, onFavorite, onAction, onQuickView }: { product: Product; featured: boolean; favorite: boolean; onFavorite: () => void; onAction: () => void; onQuickView: () => void }) {
  const isJob = product.category === 'Jobs';
  const accent = product.tone === 'violet' ? 'text-violet-300' : product.tone === 'blue' ? 'text-blue-300' : product.tone === 'green' ? 'text-emerald-300' : 'text-[#FFB38A]';
  return <motion.article layout whileHover={{ y: -4 }} transition={spring} className={`group overflow-hidden rounded-xl border border-white/10 bg-[#0D1016] ${featured ? 'sm:col-span-2 lg:col-span-6 lg:row-span-2' : 'lg:col-span-3'}`}><div className={`relative overflow-hidden ${featured ? 'aspect-[16/8] lg:aspect-[16/10]' : 'aspect-[4/3]'}`}><img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" /><button type="button" aria-label={copy.saved} onClick={onFavorite} className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border bg-black/30 backdrop-blur ${favorite ? 'border-[#FF6A00] text-[#FF6A00]' : 'border-white/15 text-white/75'}`}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></button><span className={`absolute bottom-3 left-3 text-[10px] font-bold tracking-[.14em] ${accent}`}>{product.category.toUpperCase()}</span></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-extrabold tracking-tight">{product.name}</h3><p className="mt-1 text-sm font-bold text-white/75">{product.price}</p></div><button type="button" aria-label={`${copy.quickView}: ${product.name}`} onClick={onQuickView} className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 text-white/65 hover:border-[#FF6A00]/60"><ArrowRight size={15} /></button></div><button type="button" onClick={onAction} className="mt-4 w-full rounded-lg bg-[#FF6A00] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#EB5A00]">{isJob ? 'Show interest' : copy.addCart}</button></div></motion.article>;
}

function QuickView({ product, favorite, onClose, onFavorite, onAction }: { product: Product; favorite: boolean; onClose: () => void; onFavorite: () => void; onAction: () => void }) {
  const isJob = product.category === 'Jobs';
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end bg-black/70 p-0 sm:grid sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-label={copy.quickView} onClick={onClose}><motion.article initial={{ y: 28, scale: .99 }} animate={{ y: 0, scale: 1 }} exit={{ y: 28, scale: .99 }} transition={spring} onClick={(event) => event.stopPropagation()} className="w-full overflow-hidden rounded-t-xl border border-white/10 bg-[#11151C] shadow-2xl sm:max-w-lg sm:rounded-xl"><div className="relative aspect-[16/8]"><img src={product.image} alt={product.name} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#11151C] to-transparent" /><button type="button" aria-label={copy.close} onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/25 text-white"><X size={16} /></button></div><div className="p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[.14em] text-[#FF6A00]">{product.category.toUpperCase()}</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight">{product.name}</h2><p className="mt-2 text-lg font-bold text-white/80">{product.price}</p></div><button type="button" onClick={onFavorite} aria-label={copy.saved} className={`grid h-10 w-10 place-items-center rounded-lg border ${favorite ? 'border-[#FF6A00] text-[#FF6A00]' : 'border-white/10 text-white/65'}`}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button></div><p className="mt-4 text-sm leading-6 text-white/55">{isJob ? 'Preview the role details and save your interest. Applications will open with the public launch.' : 'Preview listing. Checkout and payments will be available when VIVO AMIGO launches publicly.'}</p><button type="button" onClick={onAction} className="mt-6 w-full rounded-lg bg-[#FF6A00] px-4 py-3 text-sm font-bold text-white">{isJob ? 'Show interest' : copy.addCart}</button></div></motion.article></motion.div>;
}
