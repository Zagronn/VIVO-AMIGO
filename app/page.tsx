import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#111111] px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6A00]">VIVO AMIGO / GUATEMALA</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-bold text-[#FF6A00]">Comercio que se mueve al ritmo de la confianza.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#7A808A]">Marketplace corporativo, VIVOAMIGOPAY escrow y CARGO VIVO para Guatemala.</p>
        <Link href="/marketplace" className="mt-8 inline-flex rounded-xl bg-[#FF6A00] px-5 py-3 font-bold text-black">Entrar al marketplace</Link>
      </div>
    </main>
  );
}
