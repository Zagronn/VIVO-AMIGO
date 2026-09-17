'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { addToCartSchema, cartItemIdSchema, updateCartItemSchema } from '@/lib/validation';
import type { ActionResult } from '@/actions/reviews';

// CartItem is keyed directly by (userId, productId) in this schema — no
// wrapping Cart model — so these actions no longer need a cart lookup step.

export async function addToCart(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Sign in to add items to your cart.' };
  }

  const parsed = addToCartSchema.safeParse({
    productId: formData.get('productId'),
    quantity: formData.get('quantity') || 1,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid item.' };
  }
  const { productId, quantity } = parsed.data;

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return { success: false, error: 'That product is no longer available.' };
  }

  const existing = await db.cartItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await db.cartItem.create({ data: { userId: user.id, productId, quantity } });
  }

  revalidatePath('/cart');
  revalidatePath(`/products/${productId}`);
  return { success: true, data: undefined };
}

export async function updateCartItemQuantity(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Sign in to manage your cart.' };
  }

  const parsed = updateCartItemSchema.safeParse({
    cartItemId: formData.get('cartItemId'),
    quantity: formData.get('quantity'),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid quantity.' };
  }
  const { cartItemId, quantity } = parsed.data;

  const item = await db.cartItem.findUnique({ where: { id: cartItemId } });
  if (!item || item.userId !== user.id) {
    return { success: false, error: 'Cart item not found.' };
  }

  await db.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  revalidatePath('/cart');
  return { success: true, data: undefined };
}

export async function removeCartItem(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Sign in to manage your cart.' };
  }

  const parsed = cartItemIdSchema.safeParse({ cartItemId: formData.get('cartItemId') });
  if (!parsed.success) {
    return { success: false, error: 'Invalid item.' };
  }

  const item = await db.cartItem.findUnique({ where: { id: parsed.data.cartItemId } });
  if (!item || item.userId !== user.id) {
    return { success: false, error: 'Cart item not found.' };
  }

  await db.cartItem.delete({ where: { id: item.id } });
  revalidatePath('/cart');
  return { success: true, data: undefined };
}
