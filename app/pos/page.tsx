import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function PosHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/pos');

  const [catalogCount, salesCount, sales] = await Promise.all([
    db.posCatalogItem.count({ where: { sellerId: user.id, isActive: true } }),
    db.posSale.count({ where: { sellerId: user.id } }),
    db.posSale.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ]);

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount.toString()), 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <span className="glass-card inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-vivo-orange">
        Part of the VIVO AMIGO ecosystem
      </span>
      <h1 className="mt-4 text-3xl font-extrabold text-vivo-black sm:text-4xl">VIVO POS</h1>
      <p className="mt-2 max-w-xl text-vivo-black/60">
        A fast, install-anywhere register for street sellers and independent shops — add a price
        list, ring up a sale, and send a digital receipt, all from your phone.
      </p>

      {catalogCount === 0 ? (
        <div className="glass-card mt-8 border-dashed p-8 text-center">
          <p className="font-semibold text-vivo-black">Add your first item to get started</p>
          <p className="mt-1 text-sm text-vivo-black/60">
            Snap a price list together in under a minute — no approval, no setup.
          </p>
          <Link href="/pos/catalog" className="btn-primary mt-5 inline-flex">
            Add items
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/pos/sell" className="glass-card p-6 text-center transition hover:border-vivo-orange">
            <p className="text-3xl">🧾</p>
            <p className="mt-2 font-bold text-vivo-black">Open register</p>
            <p className="mt-1 text-xs text-vivo-black/50">{catalogCount} items ready to sell</p>
          </Link>
          <Link href="/pos/catalog" className="glass-card p-6 text-center transition hover:border-vivo-orange">
            <p className="text-3xl">🏷️</p>
            <p className="mt-2 font-bold text-vivo-black">Manage catalog</p>
            <p className="mt-1 text-xs text-vivo-black/50">Add, price, or hide items</p>
          </Link>
          <Link href="/pos/sales" className="glass-card p-6 text-center transition hover:border-vivo-orange">
            <p className="text-3xl">📊</p>
            <p className="mt-2 font-bold text-vivo-black">Sales history</p>
            <p className="mt-1 text-xs text-vivo-black/50">{salesCount} sales recorded</p>
          </Link>
        </div>
      )}

      {sales.length > 0 && (
        <div className="mt-10">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-bold text-vivo-black">Recent sales</h2>
            <p className="text-sm text-vivo-black/50">Last 10 · {formatPrice(totalRevenue)}</p>
          </div>
          <ul className="mt-4 space-y-2">
            {sales.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/pos/receipt/${s.receiptCode}`}
                  className="glass-card flex items-center justify-between p-4 text-sm"
                >
                  <span className="text-vivo-black/60">{new Date(s.createdAt).toLocaleString()}</span>
                  <span className="font-bold text-vivo-orange">{formatPrice(s.totalAmount)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
