import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatPrice } from '@/lib/money';

export const dynamic = 'force-dynamic';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/orders');

  const orders = await db.order.findMany({
    where: { customerId: user.id },
    include: { orderItems: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black">Your orders</h1>

      {orders.length === 0 ? (
        <div className="glass-card mt-8 border-dashed p-12 text-center">
          <p className="text-vivo-black/60">You haven't placed any orders yet.</p>
          <Link href="/products" className="btn-primary mt-4 inline-flex">
            Browse the marketplace
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/orders/${order.id}`} className="glass-card flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold text-vivo-black">Order #{order.id.slice(-8)}</p>
                  <p className="mt-1 text-sm text-vivo-black/50">
                    {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-vivo-orange">{formatPrice(order.totalAmount)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
