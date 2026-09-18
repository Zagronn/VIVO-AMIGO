'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/session';
import {
  createPosCatalogItemSchema,
  posCatalogItemIdSchema,
  recordPosSaleSchema,
  sendPosReceiptSmsSchema,
} from '@/lib/validation';
import type { ActionResult } from '@/actions/reviews';

// --- Catalog ---------------------------------------------------------------

/** Any signed-in user can add an item to their own VIVO POS mini catalog. */
export async function createPosCatalogItem(formData: FormData): Promise<ActionResult<{ id: string }>> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, error: 'Sign in to add items to your catalog.' };
  }

  const parsed = createPosCatalogItemSchema.safeParse({
    name: formData.get('name'),
    price: formData.get('price'),
    imageUrl: formData.get('imageUrl') || '',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid item.' };
  }

  const item = await db.posCatalogItem.create({
    data: {
      sellerId: user.id,
      name: parsed.data.name,
      price: parsed.data.price,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  revalidatePath('/pos/catalog');
  revalidatePath('/pos/sell');
  return { success: true, data: { id: item.id } };
}

export async function togglePosCatalogItemActive(formData: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, error: 'Sign in to manage your catalog.' };
  }

  const parsed = posCatalogItemIdSchema.safeParse({ id: formData.get('id') });
  if (!parsed.success) {
    return { success: false, error: 'Missing catalog item.' };
  }

  const item = await db.posCatalogItem.findUnique({ where: { id: parsed.data.id } });
  if (!item) {
    return { success: false, error: 'Catalog item not found.' };
  }
  if (item.sellerId !== user.id) {
    return { success: false, error: 'You can only manage your own catalog.' };
  }

  await db.posCatalogItem.update({
    where: { id: item.id },
    data: { isActive: !item.isActive },
  });

  revalidatePath('/pos/catalog');
  revalidatePath('/pos/sell');
  return { success: true, data: undefined };
}

// --- Sales -------------------------------------------------------------

/**
 * Records one completed sale. Takes a JSON-encoded cart rather than
 * individual FormData fields since a cart is variable-length, and it's built
 * client-side (possibly while offline — see PosRegister) so it can be queued
 * and replayed later without the seller having to redo anything.
 *
 * `clientSaleId` is generated on the device at the moment of sale and is a
 * unique DB column, so a retried/duplicate submit (e.g. the offline queue
 * firing twice) safely returns the original sale instead of double-booking
 * it — this is the idempotency key that makes "log now, sync later" safe.
 */
export async function recordPosSale(formData: FormData): Promise<ActionResult<{ id: string; receiptCode: string }>> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, error: 'Sign in to record a sale.' };
  }

  const rawItems = formData.get('items');
  let itemsJson: unknown;
  try {
    itemsJson = JSON.parse(typeof rawItems === 'string' ? rawItems : '[]');
  } catch {
    return { success: false, error: 'Could not read the cart. Please try again.' };
  }

  const parsed = recordPosSaleSchema.safeParse({
    clientSaleId: formData.get('clientSaleId'),
    receiptCode: formData.get('receiptCode'),
    items: itemsJson,
    customerPhone: formData.get('customerPhone') || '',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid sale.' };
  }

  const { clientSaleId, receiptCode, items, customerPhone } = parsed.data;

  // Idempotent replay: the offline queue may resubmit the same sale if the
  // first sync attempt's response never made it back to the browser.
  const existing = await db.posSale.findUnique({ where: { clientSaleId } });
  if (existing) {
    return { success: true, data: { id: existing.id, receiptCode: existing.receiptCode } };
  }

  const totalAmount = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

  try {
    const sale = await db.posSale.create({
      data: {
        sellerId: user.id,
        clientSaleId,
        receiptCode,
        totalAmount,
        customerPhone: customerPhone || null,
        items: {
          create: items.map((it) => ({
            catalogItemId: it.catalogItemId ?? null,
            name: it.name,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
        },
      },
    });

    revalidatePath('/pos/sales');
    return { success: true, data: { id: sale.id, receiptCode: sale.receiptCode } };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      // Lost the race with another replay of the same clientSaleId.
      const sale = await db.posSale.findUnique({ where: { clientSaleId } });
      if (sale) return { success: true, data: { id: sale.id, receiptCode: sale.receiptCode } };
    }
    console.error('Failed to record POS sale:', error);
    return { success: false, error: 'Something went wrong saving this sale.' };
  }
}

// --- Receipt SMS ---------------------------------------------------------

/**
 * Sends the receipt link over SMS via the Twilio REST API, called directly
 * with fetch (no SDK) to avoid an npm dependency this sandbox can't install
 * or verify. Requires TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN /
 * TWILIO_FROM_NUMBER — without them, this returns a clear "not configured"
 * error rather than crashing, same pattern as the VIVO SUPPORT AI action.
 */
export async function sendPosReceiptSms(formData: FormData): Promise<ActionResult<{ status: 'SENT' }>> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, error: 'Sign in to send a receipt.' };
  }

  const parsed = sendPosReceiptSmsSchema.safeParse({
    receiptCode: formData.get('receiptCode'),
    phone: formData.get('phone'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Enter a valid phone number.' };
  }

  const { receiptCode, phone } = parsed.data;

  const sale = await db.posSale.findUnique({ where: { receiptCode } });
  if (!sale) {
    return { success: false, error: 'Receipt not found.' };
  }
  if (sale.sellerId !== user.id) {
    return { success: false, error: 'You can only send receipts for your own sales.' };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return {
      success: false,
      error:
        'SMS isn’t configured yet — add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER to your .env to enable it.',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vivoamigo.com';
  const receiptUrl = `${siteUrl}/pos/receipt/${receiptCode}`;
  const body = `VIVO AMIGO receipt: ${receiptUrl}`;

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        },
        body: new URLSearchParams({ To: phone, From: fromNumber, Body: body }).toString(),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('Twilio SMS error:', response.status, errorBody);
      await db.posSale.update({ where: { id: sale.id }, data: { smsStatus: 'FAILED', customerPhone: phone } });
      return { success: false, error: 'Could not send the SMS. Double check the phone number and try again.' };
    }

    await db.posSale.update({ where: { id: sale.id }, data: { smsStatus: 'SENT', customerPhone: phone } });
    revalidatePath(`/pos/receipt/${receiptCode}`);
    return { success: true, data: { status: 'SENT' } };
  } catch (error) {
    console.error('Failed to send POS receipt SMS:', error);
    await db.posSale.update({ where: { id: sale.id }, data: { smsStatus: 'FAILED' } }).catch(() => {});
    return { success: false, error: 'Could not reach the SMS provider. Please try again shortly.' };
  }
}
