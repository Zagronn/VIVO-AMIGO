'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BadgeCheck, BusFront, Car, ChevronRight, CircleHelp, CreditCard, HeartHandshake, Home, Laptop, Menu, PackageCheck, Search, Send, ShoppingBag, Smartphone, Sprout, Store, Wrench } from 'lucide-react';

const spring = { type: 'spring' as const, stiffness: 400, damping: 25 };

const categories = [
  { name: 'Electrónica', icon: Laptop }, { name: 'Moda', icon: ShoppingBag }, { name: 'Hogar', icon: Home },
  { name: 'Automotriz', icon: Car }, { name: 'Agricultura', icon: Sprout }, { name: 'Industria', icon: Wrench }, { name: 'Servicios', icon: HeartHandshake }
];

const products = [
  { name: 'MacBook Pro M3', category: 'Electrónica', price: 'Q 14,500', mark: 'M3' },
  { name: 'Toyota Hilux 2022', category: 'Automotriz', price: 'Q 215,000', mark: 'TH' },
  { name: 'Café de altura 500g', category: 'Agricultura', price: 'Q 18.00', mark: 'CA' },
  { name: 'Casa en Zona 14', category: 'Hogar', price: 'Q 2,500,000', mark: 'Z14' }
];

export function VivoMarketplaceHome() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] text-[#25262C]">
      <div className="bg-[#1E1E1E] px-4 py-2 text-center text-[11px] font-medium text-white sm:text-xs">
        <span className="mr-2 inline-flex items-center gap-1 rounded-full bg-[#16A34A]/20 px-2 py-1 font-bold tracking-wide text-green-200"><BadgeCheck size={12} />VIVO CHECK ACTIVO</span>
        GÜVEN • ARKADAŞLIK • KOLAYLIK
      </div>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:flex-nowrap">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="VIVO AMIGO inicio">
            <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-[#25262C] ring-2 ring-[#FF6A00] ring-offset-2">
              <Image src="/images/logo.png" alt="VA shield" width={44} height={44} priority className="h-full w-full object-contain" />
            </span>
            <span className="hidden text-lg font-extrabold tracking-tight sm:block"><span className="text-[#25262C]">VIVO</span> <span className="text-[#FF6A00]">AMIGO</span></span>
          </Link>
          <form className="order-3 flex w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm focus-within:border-[#FF6A00] focus-within:ring-4 focus-within:ring-orange-100 lg:order-none lg:flex-1" onSubmit={(event) => event.preventDefault()}>
            <select aria-label="Categoría de búsqueda" className="max-w-32 border-r border-gray-200 bg-[#EDF2F7] px-3 text-xs font-bold outline-none"><option>Todas</option><option>Productos</option><option>Servicios</option></select>
            <input aria-label="Buscar en VIVO AMIGO" placeholder="¿Qué estás buscando?" className="min-w-0 flex-1 px-4 py-3 text-sm outline-none" />
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring} className="grid w-12 place-items-center bg-[#FF6A00] text-white hover:bg-[#EB5A00]" aria-label="Buscar"><Search size={19} /></motion.button>
          </form>
          <div className="ml-auto flex items-center gap-2"><motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring} className="hidden rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold sm:block">Mi cuenta</motion.button><motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring} className="grid h-10 w-10 place-items-center rounded-lg bg-[#25262C] text-white" aria-label="Carrito"><ShoppingBag size={18} /></motion.button><button className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 lg:hidden" aria-label="Menú"><Menu size={18} /></button></div>
        </div>
        <nav className="border-t border-gray-100 px-4" aria-label="Servicios VIVO"><div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto py-3 text-xs font-bold whitespace-nowrap"><Link href="/wallet" className="text-[#FF6A00]">VIVO PAY</Link><a href="https://cargovivo.com" className="text-[#2563EB]">VIVO SHIP</a><a href="#destacados" className="text-[#7C3AED]">VIVO ADS</a><Link href="/business" className="text-[#7C3AED]">VIVO BUSINESS</Link><a href="#soporte" className="text-[#16A34A]">VIVO SUPPORT</a><a href="#categorias" className="text-gray-600">Categorías</a></div></nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:py-20">
        <div><p className="mb-4 text-xs font-extrabold tracking-[0.18em] text-[#FF6A00]">EL MERCADO DIGITAL DE GUATEMALA</p><h1 className="max-w-2xl text-5xl font-extrabold leading-[1.02] tracking-tight text-[#25262C] sm:text-6xl">Todo lo que buscas, <span className="text-[#FF6A00]">en un solo lugar</span></h1><p className="mt-6 max-w-xl text-base leading-7 text-gray-600">Compra, vende y conecta con pagos protegidos, envíos rápidos y acompañamiento real en cada operación.</p><div className="mt-8 flex flex-wrap gap-3"><motion.a href="#destacados" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring} className="inline-flex items-center gap-2 rounded-lg bg-[#FF6A00] px-5 py-3 font-bold text-white shadow-sm hover:bg-[#EB5A00]">Comenzar ahora <ChevronRight size={18} /></motion.a><motion.a href="#vender" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring} className="rounded-lg border border-[#FF6A00] px-5 py-3 font-bold text-[#EB5A00] hover:bg-orange-50">Vender ahora</motion.a></div></div>
        <div className="relative mx-auto aspect-square w-full max-w-md"><div className="absolute inset-7 rounded-full border-[18px] border-[#FF6A00]/15 bg-[#EDF2F7]" /><div className="absolute inset-14 grid place-items-center overflow-hidden rounded-full bg-[#25262C] shadow-xl"><Image src="/images/logo.png" alt="VIVO AMIGO shield" width={240} height={240} className="h-48 w-48 object-contain" priority /></div><FloatingIcon icon={ShoppingBag} className="left-2 top-16" color="text-[#FF6A00]" /><FloatingIcon icon={Car} className="right-4 top-10" color="text-[#2563EB]" /><FloatingIcon icon={Smartphone} className="bottom-12 left-8" color="text-[#7C3AED]" /><FloatingIcon icon={Home} className="bottom-4 right-12" color="text-[#16A34A]" /></div>
      </section>

      <section className="border-y border-gray-200 bg-white"><div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-gray-100 px-4 sm:grid-cols-4 sm:divide-y-0 sm:px-6">{[[CreditCard, 'Pagos seguros', 'Protección VIVO PAY'], [Send, 'Envíos rápidos', 'CARGO VIVO'], [PackageCheck, 'Miles de productos', 'Mercado verificado'], [CircleHelp, 'Soporte 24/7', 'Siempre contigo']].map(([Icon, title, text]) => <div key={title as string} className="flex items-center gap-3 py-5 sm:justify-center"><span className="grid h-9 w-9 place-items-center rounded-full bg-orange-50 text-[#FF6A00]"><Icon size={18} /></span><div><p className="text-xs font-extrabold tracking-tight">{title as string}</p><p className="text-[10px] text-gray-500">{text as string}</p></div></div>)}</div></section>

      <section id="categorias" className="mx-auto max-w-7xl px-4 py-14 sm:px-6"><div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-bold tracking-[0.18em] text-[#FF6A00]">EXPLORA POR CATEGORÍAS</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight">Encuentra lo que necesitas</h2></div><a href="#destacados" className="text-sm font-bold text-[#EB5A00]">Ver todo</a></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">{categories.map(({ name, icon: Icon }) => <motion.a href="#destacados" key={name} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring} className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md"><span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#EDF2F7] text-[#FF6A00]"><Icon size={22} /></span><span className="text-xs font-bold">{name}</span></motion.a>)}</div></section>

      <section id="destacados" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6"><div className="mb-6"><p className="text-xs font-bold tracking-[0.18em] text-[#FF6A00]">DESTACADOS</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight">Productos para tu día a día</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <motion.article key={product.name} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring} className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md"><div className="grid aspect-[4/3] place-items-center rounded-md bg-[#EDF2F7] text-3xl font-extrabold text-[#FF6A00]">{product.mark}</div><p className="mt-4 text-[11px] font-medium text-gray-500">{product.category}</p><h3 className="mt-1 font-extrabold tracking-tight">{product.name}</h3><div className="mt-4 flex items-center justify-between"><strong>{product.price}</strong><button className="rounded-md bg-[#FF6A00] px-3 py-2 text-xs font-bold text-white hover:bg-[#EB5A00]">Ver producto</button></div></motion.article>)}</div></section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-14 sm:px-6 lg:grid-cols-2"><article id="vivo-pay" className="rounded-lg bg-[#25262C] p-7 text-white"><p className="text-xs font-bold tracking-[0.18em] text-[#FF6A00]">VIVO PAY</p><h2 className="mt-4 text-3xl font-extrabold tracking-tight">Paga, recibe y transfiere dinero.</h2><p className="mt-3 max-w-md text-sm text-white/65">Controla tus pagos y compras con escrow protegido en Quetzales.</p><Link href="/wallet" className="mt-6 inline-flex rounded-lg bg-[#FF6A00] px-4 py-3 text-sm font-bold hover:bg-[#EB5A00]">Abrir VIVO PAY</Link></article><article className="rounded-lg bg-[#2563EB] p-7 text-white"><p className="text-xs font-bold tracking-[0.18em] text-blue-100">VIVO SHIP</p><h2 className="mt-4 text-3xl font-extrabold tracking-tight">Enviamos a toda Latinoamérica.</h2><p className="mt-3 max-w-md text-sm text-white/70">Rastreo y soporte para que cada entrega llegue con confianza.</p><a href="https://cargovivo.com" className="mt-6 inline-flex rounded-lg bg-white px-4 py-3 text-sm font-bold text-[#2563EB]">Conocer VIVO SHIP</a></article></section>

      <section id="vender" className="bg-[#FF6A00] px-4 py-12 text-white"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-xs font-bold tracking-[0.18em] text-orange-100">VIVO BUSINESS</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight">¿Quieres vender en VIVO AMIGO?</h2><p className="mt-2 text-sm text-orange-50">Activa tu negocio, gestiona tus ventas y llega a más personas.</p></div><Link href="/business" className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#EB5A00]">Crear mi tienda</Link></div></section>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-gray-200 bg-white/95 px-2 py-2 backdrop-blur-md sm:hidden" aria-label="Navegación móvil"><MobileNav icon={Home} label="Inicio" active /><MobileNav icon={Menu} label="Categorías" /><MobileNav icon={ShoppingBag} label="Carrito" /><MobileNav icon={CreditCard} label="VIVO PAY" href="/wallet" /><MobileNav icon={Store} label="Perfil" /></nav>
    </main>
  );
}

function FloatingIcon({ icon: Icon, className, color }: { icon: typeof Car; className: string; color: string }) { return <motion.span animate={{ y: [0, -7, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className={`absolute grid h-12 w-12 place-items-center rounded-full bg-white shadow-md ${className} ${color}`}><Icon size={22} /></motion.span>; }
function MobileNav({ icon: Icon, label, active, href }: { icon: typeof Home; label: string; active?: boolean; href?: string }) { const content = <><Icon size={17} /><span>{label}</span></>; return href ? <Link href={href} className="flex flex-col items-center gap-1 text-[10px] font-bold text-gray-500">{content}</Link> : <button className={`flex flex-col items-center gap-1 text-[10px] font-bold ${active ? 'text-[#FF6A00]' : 'text-gray-500'}`}>{content}</button>; }