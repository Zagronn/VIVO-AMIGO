'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { processPaymentForOrder } from '@/actions/payments';
import type { ActionResult } from '@/actions/reviews';

/**
 * One-step demo checkout: turns the signed-in user's cart into an Order
 * (snapshotting current prices into OrderItem.unitPrice), then immediately
 * runs the mock payment for it. This is what the "Pay now" button on
 * /checkout calls.
 */
export async function checkoutCart(): Promise<ActionResult<{ orderId: string }> | never> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Sign in to check out.' };
  }

  const items = await db.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
  });

  if (items.length === 0) {
    return { success: false, error: 'Your cart is empty.' };
  }

  for (const item of items) {
    if (!item.product.isActive) {
      return { success: false, error: `"${item.product.title}" is no longer available.` };
    }
    if (item.quantity > item.product.stockQuantity) {
      return {
        success: false,
        error: `Only ${item.product.stockQuantity} of "${item.product.title}" left in stock.`,
      };
    }
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.product.price.toString()) * item.quantity,
    0
  );

  const order = await db.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        customerId: user.id,
        totalAmount,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
          })),
        },
      },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId: user.id } });

    return createdOrder;
  });

  // If payment fails for some reason the order simply stays PENDING; the
  // order page below shows a "Retry payment" action in that case.
  await processPaymentForOrder(order.id);

  redirect(`/orders/${order.id}`);
}
