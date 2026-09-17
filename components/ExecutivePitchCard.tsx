import React from 'react';

export const ExecutivePitchCard = () => (
  <section className="mx-auto my-6 max-w-2xl rounded-3xl border border-purple-500/40 bg-[#070312] p-8 text-white shadow-2xl backdrop-blur-2xl" aria-labelledby="executive-pitch-title">
    <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
      <div>
        <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#A855F7]">Protocolo 01 · Fuerte Digital</span>
        <h2 id="executive-pitch-title" className="mt-2 text-2xl font-black text-white">La infraestructura de comercio seguro de Guatemala</h2>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 font-black text-white shadow-lg shadow-purple-500/30">V</div>
    </div>

    <div className="mb-6 space-y-4 text-xs leading-relaxed text-gray-300">
      <p>No somos un simple sitio de anuncios; conectamos comercio, custodia <strong>VIVO-CHECK</strong>, auxilio vial 24/7 <strong>VIVO-ASSIST</strong> y verificación vehicular con controles de identidad y registro.</p>
      <div className="grid grid-cols-2 gap-3 font-mono">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[10px] text-gray-400">FILTRO INVISIBLE</p>
          <p className="mt-1 font-bold text-emerald-400">OCR + SAT/PNC requerido</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[10px] text-gray-400">DEFENSA AI</p>
          <p className="mt-1 font-bold text-purple-400">Auditoría y sandbox activos</p>
        </div>
      </div>
    </div>

    <div className="mb-6 grid grid-cols-2 gap-3 border-y border-white/10 py-4 font-mono md:grid-cols-4">
      <div><p className="text-[10px] text-gray-500">HORIZONTE</p><p className="mt-1 font-bold text-white">24 meses</p></div>
      <div><p className="text-[10px] text-gray-500">GMV OBJETIVO</p><p className="mt-1 font-bold text-emerald-300">$200M</p></div>
      <div><p className="text-[10px] text-gray-500">NET REVENUE</p><p className="mt-1 font-bold text-cyan-300">$12M</p></div>
      <div><p className="text-[10px] text-gray-500">VALORACIÓN</p><p className="mt-1 font-bold text-purple-300">8x-10x</p></div>
    </div>

    <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] text-[11px]">
      <div className="grid grid-cols-[1fr_1.2fr] border-b border-white/10 px-4 py-2 font-mono uppercase tracking-wider text-gray-500"><span>Dimensión</span><span>Protocol 01</span></div>
      <div className="grid grid-cols-[1fr_1.2fr] border-b border-white/5 px-4 py-3"><span className="text-gray-400">Confianza</span><span className="text-emerald-300">OCR + SAT/PNC + inspección</span></div>
      <div className="grid grid-cols-[1fr_1.2fr] px-4 py-3"><span className="text-gray-400">Economía</span><span className="text-cyan-300">3.5% blended scenario rate</span></div>
    </div>

    <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-4 text-center">
      <p className="font-mono text-[11px] text-purple-200">Escenario ilustrativo para conversación estratégica; no representa ingresos realizados ni retorno garantizado.</p>
    </div>
  </section>
);