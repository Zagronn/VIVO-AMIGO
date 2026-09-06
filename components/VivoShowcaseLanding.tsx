'use client';

import React, { useState } from 'react';

const listings = [
  {
    category: 'Toyota Hilux 2022 · 3.0 Turbo Diésel',
    price: 'Q 215,000 GTQ',
    description: 'Chasis e historial de mantenimiento verificado por VIVO-VERIFY. Incluye 1 año de asistencia en carretera VIVO-ASSIST.',
    location: 'Guatemala City',
    icon: '🚗',
    badge: 'VIVO-VERIFY VIP',
    status: 'SAT/PNC Validación Completa'
  },
  {
    category: 'Casa en Condominio · Zona 14',
    price: '$ 320,000 USD',
    description: 'Registro de propiedad libre de gravámenes. Transacción gestionada con custodia fiduciaria y firma legal.',
    location: 'Zona 14, Guatemala',
    icon: '🏡',
    badge: 'Doping Destacado',
    status: 'VIVO-SAFE Escrow'
  },
  {
    category: 'Yamaha MT-09 2023 · 890cc',
    price: 'Q 85,000 GTQ',
    description: 'Tarjeta de circulación y título a nombre del vendedor, sujetos a verificación oficial y biométrica.',
    location: 'Quetzaltenango',
    icon: '🏍️',
    badge: 'VIVO-VERIFY',
    status: 'Protegido VIVO-CHECK'
  }
];

export const VivoShowcaseLanding = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#070312] font-sans text-white selection:bg-purple-500 selection:text-white">
      <div className="flex items-center justify-center gap-2 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-900/60 px-4 py-2 text-center text-[11px] font-mono">
        <span className="animate-pulse rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">VIVO-CHECK LIVE</span>
        <span className="text-gray-300">Comercio seguro en Guatemala · <strong>Llevamos Vidas</strong></span>
      </div>

      <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/5 px-6 py-4">
        <a href="/" className="flex items-center gap-3" aria-label="vivoamigo home">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-xl font-black shadow-lg shadow-purple-500/30">V</span>
          <span><span className="block text-lg font-black leading-none tracking-tight">vivoamigo</span><span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-purple-400">Llevamos Vidas</span></span>
        </a>
        <nav className="hidden items-center gap-6 text-xs font-medium text-gray-300 md:flex" aria-label="Marketplace navigation">
          <a href="#vehiculos" className="transition-colors hover:text-purple-400">Vehículos Verificados</a>
          <a href="#inmuebles" className="transition-colors hover:text-purple-400">Inmuebles</a>
          <a href="#vivo-check" className="transition-colors hover:text-purple-400">VIVO-CHECK</a>
          <a href="#vivo-assist" className="transition-colors hover:text-purple-400">VIVO-ASSIST 24/7</a>
        </nav>
        <div className="flex items-center gap-3"><button type="button" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/10">Ingresar</button><button type="button" className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all hover:from-purple-500 hover:to-indigo-500">Publicar Anuncio</button></div>
      </header>

      <main>
        <section className="relative mx-auto max-w-5xl overflow-hidden px-6 pb-12 pt-16 text-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/15 blur-[120px]" />
          <span className="relative mb-6 inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 font-mono text-xs text-purple-300">Filtro Invisible SAT/PNC · Revisión oficial requerida</span>
          <h1 className="relative mb-4 bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent md:text-6xl">Compre y Venda con Seguridad en Guatemala</h1>
          <p className="relative mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base">Cada vehículo e inmueble puede pasar por controles de verificación. Fondos resguardados con custodia digital <strong>VIVO-CHECK</strong> hasta la aprobación de tu compra.</p>
          <form onSubmit={(event) => event.preventDefault()} className="relative mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] p-2 shadow-2xl backdrop-blur-xl"><input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Buscar vehículos, casas, terrenos o repuestos..." className="w-full bg-transparent px-4 py-3 text-xs text-white placeholder-gray-500 outline-none" aria-label="Buscar anuncios" /><button type="submit" className="whitespace-nowrap rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:from-purple-500 hover:to-indigo-500">Buscar Ahora</button></form>
        </section>

        <section id="vehiculos" className="mx-auto max-w-7xl border-t border-white/5 px-6 py-12">
          <div className="mb-8 flex items-end justify-between"><div><span className="font-mono text-[10px] font-bold uppercase tracking-widest text-purple-400">Destacados y verificados</span><h2 className="mt-1 text-2xl font-bold text-white">Vehículos e inmuebles con sello de confianza</h2></div><a href="#vehiculos" className="font-mono text-xs text-purple-400 hover:underline">Ver todos los anuncios</a></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {listings.map((listing) => <article key={listing.category} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] transition-all hover:border-purple-500/40"><div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gray-900 text-4xl"><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" /><div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2"><span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-black">Verificación requerida</span><span className="rounded-full bg-purple-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">{listing.badge}</span></div><span className="transition-transform duration-500 group-hover:scale-105" aria-hidden="true">{listing.icon}</span></div><div className="p-5"><p className="font-mono text-[10px] uppercase text-purple-400">{listing.category}</p><h3 className="mt-1 text-lg font-bold text-white transition-colors group-hover:text-purple-300">{listing.price}</h3><p className="mt-2 line-clamp-2 text-xs text-gray-400">{listing.description}</p><div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 font-mono text-[11px] text-gray-400"><span>{listing.location}</span><span className="font-bold text-emerald-400">{listing.status}</span></div></div></article>)}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl border-t border-white/5 px-6 py-8 text-center font-mono text-xs text-gray-500"><p>© 2026 vivoamigo Inc. · Marca Registrada · Slogan Oficial: <strong>Llevamos Vidas</strong></p></footer>
    </div>
  );
};