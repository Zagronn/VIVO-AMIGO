import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatPrice, multiplyPrice } from '@/lib/money';
import { RetryPaymentForm } from '@/components/RetryPaymentForm';
import { DispatchShipmentForm } from '@/components/DispatchShipmentForm';

export const dynamic = 'force-dynamic';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/orders/${params.id}`);

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      orderItems: { include: { product: true } },
      payment: true,
      shipment: true,
    },
  });

  if (!order) notFound();
  if (order.customerId !== user.id && user.role !== 'ADMIN') notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-vivo-black">Order #{order.id.slice(-8)}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>
          {order.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-vivo-black/50">
        Placed {new Date(order.createdAt).toLocaleString()}
      </p>

      <div className="glass-card mt-8 divide-y divide-vivo-black/5">
        {order.orderItems.map((item) => (
          <div key={item.id} className="flex justify-between p-4 text-sm">
            <span>
              {item.product.title} × {item.quantity}
            </span>
            <span className="font-medium">{formatPrice(multiplyPrice(item.unitPrice, item.quantity))}</span>
          </div>
        ))}
        <div className="flex justify-between p-4 font-bold">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      {order.status === 'PENDING' && order.customerId === user.id && (
        <div className="mt-6">
          <p className="mb-2 text-sm text-vivo-black/60">Payment has not gone through yet.</p>
          <RetryPaymentForm orderId={order.id} />
        </div>
      )}

      {order.payment && (
        <div className="glass-card mt-6 p-5">
          <h2 className="font-bold text-vivo-black">Payment</h2>
          <p className="mt-1 text-sm text-vivo-black/60">
            {order.payment.paymentGateway} · {order.payment.status} · {formatPrice(order.payment.amount)}
          </p>
        </div>
      )}

      {order.shipment ? (
        <div className="glass-card mt-6 p-5">
          <h2 className="font-bold text-vivo-black">Shipment</h2>
          <p className="mt-1 text-sm text-vivo-black/60">
            {order.shipment.carrier} · Tracking code{' '}
            <span className="font-mono font-semibold text-vivo-black">{order.shipment.trackingCode}</span> ·{' '}
            {order.shipment.status}
          </p>
        </div>
      ) : (
        user.role === 'ADMIN' &&
        order.status === 'PAID' && (
          <div className="glass-card mt-6 p-5">
            <h2 className="mb-3 font-bold text-vivo-black">Dispatch this order</h2>
            <DispatchShipmentForm orderId={order.id} />
          </div>
        )
      )}

      <Link href="/products" className="mt-8 block text-sm text-vivo-black/50 hover:underline">
        ← Continue shopping
      </Link>
    </div>
  );
}
