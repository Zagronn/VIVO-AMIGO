'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { createRealEstateListingSchema } from '@/lib/validation';
import type { ActionResult } from '@/actions/reviews';

/** Any signed-in user posts a real estate listing (no vendor approval needed). */
export async function createRealEstateListing(formData: FormData): Promise<ActionResult<{ id: string }>> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, error: 'Sign in to post a listing.' };
  }

  const parsed = createRealEstateListingSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || '',
    price: formData.get('price'),
    listingType: formData.get('listingType'),
    propertyType: formData.get('propertyType'),
    bedrooms: formData.get('bedrooms') || undefined,
    bathrooms: formData.get('bathrooms') || undefined,
    areaSqm: formData.get('areaSqm') || undefined,
    city: formData.get('city'),
    imageUrl: formData.get('imageUrl'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid listing details.' };
  }

  const { title, description, price, listingType, propertyType, bedrooms, bathrooms, areaSqm, city, imageUrl } =
    parsed.data;

  const listing = await db.realEstateListing.create({
    data: {
      ownerId: user.id,
      title,
      description: description || null,
      price,
      listingType,
      propertyType,
      bedrooms: bedrooms ?? null,
      bathrooms: bathrooms ?? null,
      areaSqm: areaSqm ?? null,
      city,
      images: [imageUrl],
    },
  });

  revalidatePath('/real-estate');
  return { success: true, data: { id: listing.id } };
}

/** The listing's owner (or an admin) toggles it active/inactive. */
export async function toggleRealEstateListingActive(formData: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, error: 'Sign in to manage listings.' };
  }

  const id = formData.get('id') as string | null;
  if (!id) {
    return { success: false, error: 'Missing listing.' };
  }

  const listing = await db.realEstateListing.findUnique({ where: { id } });
  if (!listing) {
    return { success: false, error: 'Listing not found.' };
  }

  if (listing.ownerId !== user.id && user.role !== 'ADMIN') {
    return { success: false, error: 'You can only manage your own listings.' };
  }

  await db.realEstateListing.update({
    where: { id },
    data: { isActive: !listing.isActive },
  });

  revalidatePath('/real-estate');
  revalidatePath(`/real-estate/${id}`);
  return { success: true, data: undefined };
}
