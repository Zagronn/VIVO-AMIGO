'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import type { ActionResult } from '@/actions/reviews';

/**
 * Core payment logic, reused by both the checkout flow (called directly,
 * server-to-server) and the standalone form action below.
 *
 * The charge amount is read from the order itself (order.totalAmount),
 * never trusted from client input, and only the order's owner (customer)
 * or an admin may trigger payment for it. `Payment.status` is a plain
 * string in this schema (not an enum), so 'SUCCESS' is a convention, not
 * a type-checked value — keep it in sync with wherever status is displayed.
 */
export async function processPaymentForOrder(
  orderId: string,
  paymentGateway = 'STRIPE_MOCK'
): Promise<ActionResult<{ paymentId: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'You need to be signed in to pay for an order.' };
  }

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { success: false, error: 'Order not found.' };
  }
  if (order.customerId !== user.id && user.role !== 'ADMIN') {
    return { success: false, error: 'You are not allowed to pay for this order.' };
  }
  if (order.status !== 'PENDING') {
    return { success: false, error: `Order is already ${order.status.toLowerCase()}.` };
  }

  try {
    const [payment] = await db.$transaction([
      db.payment.create({
        data: {
          orderId,
          paymentGateway,
          status: 'SUCCESS',
          amount: order.totalAmount,
        },
      }),
      db.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      }),
    ]);

    revalidatePath('/admin/dashboard');
    revalidatePath(`/orders/${orderId}`);
    return { success: true, data: { paymentId: payment.id } };
  } catch (error) {
    console.error('Payment processing error:', error);
    return { success: false, error: 'Payment transaction failed.' };
  }
}

/** Form-action wrapper around processPaymentForOrder, e.g. a "Retry payment" button. */
export async function processOrderPayment(formData: FormData): Promise<ActionResult<{ paymentId: string }>> {
  const orderId = formData.get('orderId') as string | null;
  const paymentGateway = (formData.get('paymentGateway') as string | null) || 'STRIPE_MOCK';

  if (!orderId) {
    return { success: false, error: 'Missing order reference.' };
  }

  return processPaymentForOrder(orderId, paymentGateway);
}
