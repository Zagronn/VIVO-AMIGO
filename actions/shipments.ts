'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { shipmentSchema } from '@/lib/validation';
import type { ActionResult } from '@/actions/reviews';
import crypto from 'crypto';

function generateTrackingCode(): string {
  return `TRK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

/**
 * Dispatches a shipment for a paid order. Admin-only, and requires the
 * order to be PAID first. `Shipment.status` is a plain string in this
 * schema; 'DISPATCHED' is a convention kept in sync with the UI.
 */
export async function createOrderShipment(
  formData: FormData
): Promise<ActionResult<{ shipmentId: string; trackingCode: string }>> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Only an admin can dispatch shipments.' };
  }

  const parsed = shipmentSchema.safeParse({
    orderId: formData.get('orderId'),
    carrier: formData.get('carrier') || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid shipment request.' };
  }

  const { orderId, carrier } = parsed.data;
  const trackingCodeInput = formData.get('trackingCode') as string | null;
  const trackingCode = trackingCodeInput?.trim() || generateTrackingCode();

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { success: false, error: 'Order not found.' };
  }
  if (order.status !== 'PAID') {
    return { success: false, error: 'Order must be paid before it can be shipped.' };
  }

  try {
    const [shipment] = await db.$transaction([
      db.shipment.create({
        data: {
          orderId,
          carrier,
          trackingCode,
          status: 'DISPATCHED',
        },
      }),
      db.order.update({
        where: { id: orderId },
        data: { status: 'SHIPPED' },
      }),
    ]);

    revalidatePath('/admin/dashboard');
    revalidatePath(`/orders/${orderId}`);
    return { success: true, data: { shipmentId: shipment.id, trackingCode: shipment.trackingCode } };
  } catch (error) {
    console.error('Shipment creation error:', error);
    return { success: false, error: 'Could not initialize shipment tracking record.' };
  }
}
