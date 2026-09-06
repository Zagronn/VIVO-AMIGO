import Link from 'next/link';
import { CategoryBar } from '../components/CategoryBar';
import { VivoAssistSosModal } from '../components/VivoAssistSosModal';

const categories = [
  { title: 'Vehículos Destacados', items: ['BYD Eléctrico', 'Toyota Hilux'], href: '/listings?category=VEHICLES', cta: 'Ver más vehículos', badges: ['-15%', 'Remate'] },
  { title: 'Construcción y Metal', items: ['Soldadoras', 'Varillas Cemento'], href: '/listings?category=CONSTRUCTION', cta: 'Explorar materiales', badges: ['-30%', '-20%'] },
  { title: 'Servicios Exprés', items: ['Fletes en Zona 10', 'Albañil Profesional'], href: '/services', cta: 'Solicitar servicio', badges: ['', ''] },
  { title: 'Inmuebles en Zona Viva', items: ['Apartamentos en Zona 10 y 14'], href: '/listings?category=REAL_ESTATE', cta: 'Ver catálogo completo', badges: ['Verificado por Notario'] }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#E3E6E6] pb-12">
      <section className="relative bg-black px-6 pb-16 pt-4 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <span className="rounded bg-[#FF6A00] px-2.5 py-1 text-xs font-black uppercase text-black">Mercado Digital Guatemala</span>
            <h1 className="mt-2 text-2xl font-black md:text-3xl">Ofertas de Hoy en Tu Zona</h1>
            <p className="text-sm text-gray-300">Encuentra todo con Escrow seguro y entrega directa.</p>
          </div>
        </div>
      </section>
      <CategoryBar />
      <div className="mx-auto max-w-7xl px-4">
        <VivoAssistSosModal />
      </div>

      <section className="mx-auto -mt-10 grid max-w-7xl grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <article key={category.title} className="flex flex-col justify-between rounded-md border border-gray-200 bg-white p-4 shadow-md">
            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-900">{category.title}</h2>
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((item, index) => (
                  <div key={item} className="rounded bg-gray-50 p-2">
                    <div className="relative mb-1 h-20 rounded bg-gray-200">
                      {category.badges[index] && <span className="absolute left-1 top-1 rounded bg-red-600 px-1 text-[10px] font-bold text-white">{category.badges[index]}</span>}
                    </div>
                    <p className="truncate text-xs font-bold">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <Link href={category.href} className="mt-4 block text-xs font-bold text-[#FF6A00] hover:underline">{category.cta} →</Link>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-6 max-w-7xl px-4">
        <div className="rounded-md border border-gray-200 bg-white p-4 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Remates de Hoy (Ofertas con Escrow)</h2>
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <article key={item} className="min-w-[180px] flex-shrink-0 rounded-md border border-gray-100 bg-gray-50 p-3">
                <div className="relative mb-2 h-32 rounded bg-gray-200"><span className="absolute bottom-1 left-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Hasta 45% OFF</span></div>
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">Oferta Limitada</span>
                <p className="mt-1 text-sm font-bold text-slate-900">Q{(item * 1250).toLocaleString('es-GT')}</p>
                <p className="truncate text-xs text-gray-500">Herramienta Industrial #{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
