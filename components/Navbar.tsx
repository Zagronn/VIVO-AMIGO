import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { logoutUser } from '@/actions/auth';
import { Logo } from '@/components/Logo';

export async function Navbar() {
  const user = await getCurrentUser();

  let cartCount = 0;
  if (user) {
    const items = await db.cartItem.findMany({
      where: { userId: user.id },
      select: { quantity: true },
    });
    cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-vivo-black/10 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Logo />

          {/* Location Selector */}
          <div className="hidden items-center gap-1.5 text-xs font-medium text-vivo-black/60 hover:text-vivo-orange cursor-pointer lg:flex">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Enviar a <span className="font-bold text-vivo-black">Guatemala</span></span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mx-4 flex flex-1 items-center gap-2 max-w-2xl">
          <div className="relative hidden w-40 sm:block">
            <select className="h-full w-full rounded-l-full border border-r-0 border-vivo-black/10 bg-vivo-black/5 px-3 py-2 text-xs font-medium text-vivo-black/70 outline-none appearance-none cursor-pointer">
              <option>Todas las categorías</option>
              <option>Electrónica</option>
              <option>Moda</option>
              <option>Hogar</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          <form action="/search" className="relative flex flex-1 items-center">
            <input
              type="text"
              name="q"
              placeholder="Buscar productos, marcas y más..."
              className="h-full w-full rounded-full border border-vivo-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-vivo-orange focus:ring-1 focus:ring-vivo-orange sm:rounded-l-none"
            />
            <button
              type="submit"
              className="absolute right-0 flex h-full w-12 items-center justify-center rounded-r-full bg-vivo-orange text-white hover:bg-vivo-orange-dark transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </form>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-6 text-xs font-medium text-vivo-black/70">
          <Link href="/pay" className="hidden hover:text-vivo-orange lg:block uppercase font-bold">
            VIVO PAY
          </Link>

          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link href="/login" className="hover:text-vivo-orange">Iniciar sesión</Link>
                <Link href="/register" className="hover:text-vivo-orange">Mi cuenta</Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="hover:text-vivo-orange">Mi cuenta</Link>
                <form action={logoutUser}>
                  <button type="submit" className="hover:text-vivo-orange">Cerrar sesión</button>
                </form>
              </div>
            )}
          </div>

          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-full bg-vivo-black/5 px-3 py-2 transition hover:bg-vivo-black/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.88h12.88a2 2 0 0 0 2-2V7.82a2 2 0 0 0-2-2h-13.34z"/></svg>
            <span className="font-bold text-vivo-black">Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-vivo-orange text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
