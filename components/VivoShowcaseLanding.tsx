'use client';

import React, { useMemo, useState } from 'react';

const categories = [
  ['▣', 'Electrónica'], ['◇', 'Moda'], ['⌂', 'Hogar'], ['▰', 'Automotriz'],
  ['✣', 'Agricultura'], ['▤', 'Industria'], ['✦', 'Servicios']
];
const listings = [
  { title: 'Café de altura 500g', seller: 'La Esquina', price: 'Q 18.00', category: 'Agricultura', mark: 'CA' },
  { title: 'Canasta tejida', seller: 'Manos Vivas', price: 'Q 145.00', category: 'Hogar', mark: 'MV' },
  { title: 'Miel de abeja', seller: 'Colmena', price: 'Q 42.00', category: 'Agricultura', mark: 'CO' },
  { title: 'Pan dulce artesanal', seller: 'Horno 7', price: 'Q 12.00', category: 'Servicios', mark: 'H7' }
];

export const VivoShowcaseLanding = () => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => listings.filter((item) => `${item.title} ${item.seller} ${item.category}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111]">
      <div className="border-b border-[#111111]/10 bg-[#111111] px-4 py-2 text-center text-xs font-medium text-white">
        <span className="mr-2 rounded-full bg-[#16A34A] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide">VIVO CHECK activo</span>
        Comercio seguro en Guatemala · protección para cada transacción
      </div>
      <header className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-4 lg:flex-nowrap">
          <a href="/" className="flex shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#FF6A00] text-lg text-white">V</span> VIVO AMIGO</a>
          <span className="rounded-full bg-[#FBF7AA] px-3 py-2 text-xs font-bold">⌖ Enviar a Guatemala</span>
          <form className="order-3 flex w-full overflow-hidden rounded-full border border-black/10 bg-white shadow-sm lg:order-none lg:flex-1" onSubmit={(event) => event.preventDefault()}>
            <input aria-label="Buscar productos" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar productos, servicios y oportunidades" className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm outline-none" />
            <button className="bg-[#FF6A00] px-5 text-sm font-extrabold text-white hover:bg-[#EB5C00]" type="submit">Buscar</button>
          </form>
          <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold">Ingresar</button>
          <button className="rounded-full bg-[#111111] px-4 py-2 text-sm font-bold text-white">Publicar</button>
        </div>
        <nav className="mt-4 flex gap-6 overflow-x-auto border-t border-black/10 pt-3 text-xs font-bold text-black/60" aria-label="Categorías principales">
          <a href="#categorias">Categorías</a><a href="#destacados">Destacados</a><a href="#vivo-pay">VIVO PAY</a><a href="/trade-in">Trade-In</a><a href="/fair-price">Precio justo</a><a href="/barter">Barter</a><a href="https://cargovivo.com" target="_blank" rel="noreferrer">CARGO VIVO</a><a href="#soporte">Soporte</a>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <section className="relative mt-6 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
          <div className="grid min-h-[420px] items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1.05fr_.95fr] lg:p-16">
            <div><p className="mb-4 text-xs font-extrabold uppercase tracking-[.2em] text-[#FF6A00]">VIVO AMIGO / mercado vivo</p><h1 className="max-w-2xl text-5xl font-extrabold leading-[.98] tracking-tight sm:text-7xl">Todo lo que mueve a Guatemala.</h1><p className="mt-6 max-w-xl text-base leading-7 text-black/60">Compra, vende y protege cada operación con una red hecha para personas, negocios y comunidades.</p><div className="mt-8 flex flex-wrap gap-3"><a href="#destacados" className="rounded-full bg-[#FF6A00] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 hover:bg-[#EB5C00]">Comenzar ahora <span className="ml-4">→</span></a><a href="/marketplace" className="rounded-full border-2 border-[#FF6A00] px-6 py-3 text-sm font-extrabold text-[#EB5C00] hover:bg-[#FBF7AA]">Vender ahora <span className="ml-4">↗</span></a></div></div>
            <div className="relative min-h-[280px] overflow-hidden rounded-2xl bg-[#FBF7AA] p-8"><div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border-[26px] border-[#FF6A00]/20"/><div className="absolute bottom-6 right-20 h-24 w-24 rounded-full border-[10px] border-[#FF6A00]"/><p className="relative text-xs font-extrabold uppercase tracking-[.2em] text-[#EB5C00]">Banner dinámico</p><h2 className="relative mt-5 max-w-xs text-4xl font-extrabold tracking-tight">Compra local. Crece juntos.</h2><p className="relative mt-4 text-sm text-black/60">Ofertas de vendedores verificados, en Quetzales.</p></div>
          </div>
        </section>
        <section id="categorias" className="py-12"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#FF6A00]">Explora</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight">Encuentra tu próxima oportunidad</h2></div><span className="hidden text-xs font-bold text-black/40 sm:block">7 categorías</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">{categories.map(([icon, label]) => <a href="#destacados" key={label} className="rounded-2xl border border-black/10 bg-white p-4 text-center transition hover:-translate-y-1 hover:border-[#FF6A00]"><span className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-[#F8F9FA] text-xl text-[#FF6A00]">{icon}</span><span className="text-xs font-bold">{label}</span></a>)}</div></section>
        <section id="destacados" className="grid gap-4 lg:grid-cols-[1fr_360px]"><div className="rounded-2xl bg-white p-6 ring-1 ring-black/5"><div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#FF6A00]">Marketplace</p><h2 className="mt-2 text-3xl font-extrabold">Productos destacados</h2></div><span className="text-xs font-bold text-black/40">{filtered.length} resultados</span></div><div className="grid gap-3 sm:grid-cols-2">{filtered.map((item) => <article key={item.title} className="rounded-2xl border border-black/10 p-4"><div className="grid h-32 place-items-center rounded-xl bg-[#F8F9FA] text-4xl font-extrabold text-[#FF6A00]">{item.mark}</div><p className="mt-4 text-xs font-bold text-black/50">{item.seller} · {item.category}</p><h3 className="mt-1 font-extrabold">{item.title}</h3><div className="mt-4 flex items-center justify-between"><strong className="text-lg">{item.price}</strong><button className="rounded-full bg-[#FF6A00] px-3 py-2 text-xs font-extrabold text-white">Ver producto</button></div></article>)}</div></div><div className="space-y-4"><div id="vivo-pay" className="relative overflow-hidden rounded-2xl bg-[#111111] p-6 text-white"><div className="absolute -right-20 -top-20 h-48 w-48 rounded-full border-[22px] border-[#FF6A00]/30 shadow-[0_0_80px_#FF6A00]"/><p className="relative text-xs font-extrabold uppercase tracking-[.2em] text-[#FF6A00]">VIVO PAY</p><h3 className="relative mt-10 text-2xl font-extrabold">Tu dinero, bajo control.</h3><p className="relative mt-3 text-sm text-white/60">Escrow protegido y pagos en Quetzales.</p><strong className="relative mt-6 block text-3xl">Q 8,420.00</strong><button className="relative mt-6 rounded-full bg-[#FF6A00] px-4 py-2 text-xs font-extrabold text-white">Abrir billetera →</button></div><div id="vivo-ship" className="rounded-2xl bg-[#2563EB] p-6 text-white"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-100">VIVO SHIP</p><h3 className="mt-8 text-2xl font-extrabold">Rastrea tu carga.</h3><div className="mt-5 flex items-center justify-between rounded-xl bg-white/10 p-3 text-sm"><span>VIVO-8F4A</span><span className="font-bold">En tránsito · 64%</span></div></div><div id="soporte" className="rounded-2xl bg-[#16A34A] p-6 text-white"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-green-100">SUPPORT</p><h3 className="mt-5 text-2xl font-extrabold">Personas que responden.</h3><p className="mt-2 text-sm text-green-50">Ayuda en cada paso, todos los días.</p></div></div></section>
      </main>
    </div>
  );
};
