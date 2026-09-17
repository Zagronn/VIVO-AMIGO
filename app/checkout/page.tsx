import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatPrice, multiplyPrice } from '@/lib/money';
import { CheckoutButton } from '@/components/CheckoutButton';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/checkout');

  const items = await db.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
  });

  if (items.length === 0) redirect('/cart');

  const totalAmount = items.reduce((sum, item) => sum + multiplyPrice(item.product.price, item.quantity), 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black">Checkout</h1>
      <p className="mt-2 text-vivo-black/60">
        This is a demo checkout — payment is simulated (mock gateway), no real card is charged.
      </p>

      <div className="glass-card mt-8 divide-y divide-vivo-black/5">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between p-4 text-sm">
            <span>
              {item.product.title} × {item.quantity}
            </span>
            <span className="font-medium">{formatPrice(multiplyPrice(item.product.price, item.quantity))}</span>
          </div>
        ))}
        <div className="flex justify-between p-4 font-bold">
          <span>Total</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>
      </div>

      <div className="mt-8">
        <CheckoutButton totalAmount={totalAmount} />
      </div>

      <Link href="/cart" className="mt-4 block text-center text-sm text-vivo-black/50 hover:underline">
        ← Back to cart
      </Link>
    </div>
  );
}
