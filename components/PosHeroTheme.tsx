import React from 'react';

export const PosHeroTheme = () => (
  <main className="flex min-h-screen flex-col items-center justify-center bg-vivo-dark bg-vivo-gradient p-8 font-sans text-white">
    <header className="flex w-full max-w-6xl items-center justify-between border-b border-vivo-violet/20 py-4">
      <a href="/" className="flex items-center gap-2" aria-label="vivoamigo POS home">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-vivo-blue to-vivo-neon text-sm font-black text-white shadow-lg shadow-vivo-violet/50">V</span>
        <span className="text-xl font-black tracking-wider">vivo<span className="text-vivo-neon">amigo</span> POS</span>
      </a>
      <nav className="hidden gap-6 text-sm font-medium text-gray-300 md:flex" aria-label="POS navigation">
        <a href="#features" className="transition-colors hover:text-vivo-neon">Features</a>
        <a href="#pricing" className="transition-colors hover:text-vivo-neon">Pricing</a>
        <a href="#hosted" className="transition-colors hover:text-vivo-neon">Hosted</a>
        <a href="#resources" className="transition-colors hover:text-vivo-neon">Resources</a>
      </nav>
      <button type="button" className="rounded-full bg-vivo-blue px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-600">VIVO APP STORE</button>
    </header>

    <section className="my-12 grid w-full max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-2" aria-labelledby="pos-hero-title">
      <div className="space-y-6">
        <span className="inline-block rounded-full border border-vivo-violet/40 bg-vivo-violet/20 px-3 py-1 text-xs font-semibold text-vivo-neon">Top Choice For 5,800+ Merchants in Guatemala</span>
        <h1 id="pos-hero-title" className="bg-gradient-to-r from-white via-vivo-light to-vivo-neon bg-clip-text text-4xl font-black leading-tight text-transparent md:text-6xl">Our Advanced POS Software Solutions</h1>
        <p className="max-w-md text-sm leading-relaxed text-gray-300">Nuestra solución POS de vanguardia integrada con VIVO-CHECK Escrow, pagos Visanet/NeoNet y emisión de facturación electrónica SAT.</p>
        <div className="flex items-center gap-4"><button type="button" className="rounded-full bg-white px-6 py-3 text-xs font-black uppercase tracking-wider text-vivo-dark shadow-xl transition-all hover:bg-gray-200">GET STARTED NOW</button><button type="button" className="flex items-center gap-2 text-xs font-bold text-white transition-colors hover:text-vivo-neon" aria-label="Play POS product video"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-vivo-violet/50 bg-vivo-violet/30">▶</span>Play Video</button></div>
      </div>

      <div className="relative flex justify-center"><div className="absolute -inset-4 bg-vivo-neon-glow opacity-70 blur-2xl" /><div className="relative w-full max-w-sm rounded-3xl border border-vivo-violet/30 bg-vivo-surface p-6 shadow-2xl backdrop-blur-xl"><div className="mb-4 flex items-center justify-between"><span className="font-mono text-[10px] text-gray-400">Profit And Loss</span><span className="text-xs font-black text-[#25D366]">+18.4%</span></div><p className="text-2xl font-black text-white">Q682.50 GTQ</p><p className="mb-4 text-[10px] text-gray-400">From 1 Day</p><div className="space-y-2 rounded-xl border border-vivo-violet/20 bg-vivo-dark/80 p-4"><div className="flex justify-between text-xs"><span className="text-gray-400">Quick Transfer</span><span className="font-bold text-vivo-neon">VIVO-CHECK</span></div><div className="flex items-center justify-between rounded-lg border border-vivo-violet/30 bg-vivo-surface p-2 text-xs"><span className="text-gray-300">Enter Amount</span><span className="font-mono font-bold text-white">Q1,240.00</span></div></div></div></div>
    </section>
  </main>
);
