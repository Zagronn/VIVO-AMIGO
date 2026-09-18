'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { createSecondHandListingSchema } from '@/lib/validation';
import type { ActionResult } from '@/actions/reviews';

/** Any signed-in user can post a second-hand listing — no vendor approval required. */
export async function createSecondHandListing(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, error: 'Sign in to post a listing.' };
  }

  const parsed = createSecondHandListingSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || '',
    price: formData.get('price'),
    category: formData.get('category'),
    condition: formData.get('condition'),
    city: formData.get('city'),
    imageUrl: formData.get('imageUrl'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid listing details.' };
  }

  const { title, description, price, category, condition, city, imageUrl } = parsed.data;

  const listing = await db.secondHandListing.create({
    data: {
      sellerId: user.id,
      title,
      description: description || null,
      price,
      category,
      condition,
      city,
      images: [imageUrl],
    },
  });

  revalidatePath('/second-hand');
  return { success: true, data: { id: listing.id } };
}

/** The seller (or an admin) toggles one of their own listings active/inactive. */
export async function toggleSecondHandListingActive(formData: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, error: 'Sign in to manage your listings.' };
  }

  const id = formData.get('id') as string | null;
  if (!id) {
    return { success: false, error: 'Missing listing.' };
  }

  const listing = await db.secondHandListing.findUnique({ where: { id } });
  if (!listing) {
    return { success: false, error: 'Listing not found.' };
  }

  if (listing.sellerId !== user.id && user.role !== 'ADMIN') {
    return { success: false, error: 'You can only manage your own listings.' };
  }

  await db.secondHandListing.update({
    where: { id },
    data: { isActive: !listing.isActive },
  });

  revalidatePath('/second-hand');
  revalidatePath(`/second-hand/${id}`);
  return { success: true, data: undefined };
}
