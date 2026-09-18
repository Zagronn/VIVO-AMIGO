import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatPrice, multiplyPrice } from '@/lib/money';
import { CartItemControls } from '@/components/CartItemControls';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/cart');

  const items = await db.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { id: 'asc' },
  });

  const totalAmount = items.reduce((sum, item) => sum + multiplyPrice(item.product.price, item.quantity), 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black">Your cart</h1>

      {items.length === 0 ? (
        <div className="glass-card mt-10 border-dashed p-12 text-center">
          <p className="text-vivo-black/60">Your cart is empty.</p>
          <Link href="/products" className="btn-primary mt-4 inline-flex">
            Browse the marketplace
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <ul className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <li key={item.id} className="glass-card flex items-center gap-4 p-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-vivo-cream">
                  <Image
                    src={item.product.images[0] ?? 'https://picsum.photos/seed/vivo-fallback/200/200'}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.productId}`} className="font-semibold hover:text-vivo-orange">
                    {item.product.title}
                  </Link>
                  <p className="text-sm text-vivo-black/50">{formatPrice(item.product.price)} each</p>
                  <div className="mt-2">
                    <CartItemControls cartItemId={item.id} quantity={item.quantity} />
                  </div>
                </div>
                <p className="font-bold text-vivo-black">
                  {formatPrice(multiplyPrice(item.product.price, item.quantity))}
                </p>
              </li>
            ))}
          </ul>

          <div className="glass-card h-fit p-6">
            <h2 className="text-lg font-bold text-vivo-black">Order summary</h2>
            <div className="mt-4 flex justify-between text-sm text-vivo-black/60">
              <span>Subtotal</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-vivo-black/60">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="mt-4 flex justify-between border-t border-vivo-black/10 pt-4 font-bold text-vivo-black">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <Link href="/checkout" className="btn-primary mt-6 w-full">
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
