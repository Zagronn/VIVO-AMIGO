import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/money';

export const dynamic = 'force-dynamic';

const smsStyles: Record<string, string> = {
  NOT_SENT: 'bg-vivo-black/5 text-vivo-black/40',
  SENT: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

export default async function PosSalesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/pos/sales');

  const sales = await db.posSale.findMany({
    where: { sellerId: user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount.toString()), 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-extrabold text-vivo-black">Sales history</h1>
        <p className="text-sm text-vivo-black/50">
          {sales.length} sale{sales.length === 1 ? '' : 's'} · {formatPrice(totalRevenue)}
        </p>
      </div>

      {sales.length === 0 ? (
        <div className="glass-card mt-8 border-dashed p-12 text-center">
          <p className="text-vivo-black/60">No sales recorded yet.</p>
          <Link href="/pos/sell" className="btn-primary mt-4 inline-flex">
            Open the register
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {sales.map((sale) => (
            <li key={sale.id}>
              <Link href={`/pos/receipt/${sale.receiptCode}`} className="glass-card block p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-vivo-black/40">#{sale.receiptCode}</p>
                    <p className="text-sm text-vivo-black/60">
                      {sale.items.length} item{sale.items.length === 1 ? '' : 's'} ·{' '}
                      {new Date(sale.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${smsStyles[sale.smsStatus]}`}>
                      SMS: {sale.smsStatus.replace('_', ' ').toLowerCase()}
                    </span>
                    <span className="font-bold text-vivo-orange">{formatPrice(sale.totalAmount)}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
