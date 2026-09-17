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
    <header className="glass-nav sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-6 text-sm font-medium text-vivo-black/70 sm:flex">
          <Link href="/products" className="hover:text-vivo-orange">
            Marketplace
          </Link>
          <Link href="/classifieds" className="hover:text-vivo-orange">
            Classifieds
          </Link>
          <Link href="/#ecosystem" className="hover:text-vivo-orange">
            Ecosystem
          </Link>
          <Link href="/sell" className="hover:text-vivo-orange">
            Sell
          </Link>
          {user && (
            <Link href="/orders" className="hover:text-vivo-orange">
              Orders
            </Link>
          )}
          {user?.vendorProfile?.status === 'ACTIVE' && (
            <Link href="/vendor/dashboard" className="hover:text-vivo-orange">
              My store
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin/dashboard" className="hover:text-vivo-orange">
              Admin
            </Link>
          )}
        </nav>

        <form action="/search" className="hidden max-w-[220px] flex-1 lg:flex">
          <input
            type="text"
            name="q"
            placeholder="Search products…"
            className="w-full rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm backdrop-blur placeholder:text-vivo-black/40 focus:border-vivo-orange focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium backdrop-blur hover:border-vivo-orange"
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-vivo-orange text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <form action={logoutUser}>
              <button type="submit" className="text-sm font-medium text-vivo-black/70 hover:text-vivo-orange">
                Sign out ({user.name.split(' ')[0]})
              </button>
            </form>
          ) : (
            <Link href="/login" className="btn-primary !px-4 !py-2 text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
