'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { createVehicleListingSchema } from '@/lib/validation';
import type { ActionResult } from '@/actions/reviews';

/** Any signed-in user can post a vehicle listing. */
export async function createVehicleListing(formData: FormData): Promise<ActionResult<{ id: string }>> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, error: 'Sign in to post a listing.' };
  }

  const parsed = createVehicleListingSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || '',
    price: formData.get('price'),
    make: formData.get('make'),
    model: formData.get('model'),
    year: formData.get('year'),
    mileageKm: formData.get('mileageKm') || undefined,
    condition: formData.get('condition'),
    transmission: formData.get('transmission') || '',
    fuelType: formData.get('fuelType') || '',
    city: formData.get('city'),
    imageUrl: formData.get('imageUrl'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid listing details.' };
  }

  const { title, description, price, make, model, year, mileageKm, condition, transmission, fuelType, city, imageUrl } =
    parsed.data;

  const listing = await db.vehicleListing.create({
    data: {
      ownerId: user.id,
      title,
      description: description || null,
      price,
      make,
      model,
      year,
      mileageKm: mileageKm ?? null,
      condition,
      transmission: transmission || null,
      fuelType: fuelType || null,
      city,
      images: [imageUrl],
    },
  });

  revalidatePath('/vehicles');
  return { success: true, data: { id: listing.id } };
}

/** The listing's owner (or an admin) toggles it active/inactive. */
export async function toggleVehicleListingActive(formData: FormData): Promise<ActionResult> {
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

  const listing = await db.vehicleListing.findUnique({ where: { id } });
  if (!listing) {
    return { success: false, error: 'Listing not found.' };
  }

  if (listing.ownerId !== user.id && user.role !== 'ADMIN') {
    return { success: false, error: 'You can only manage your own listings.' };
  }

  await db.vehicleListing.update({
    where: { id },
    data: { isActive: !listing.isActive },
  });

  revalidatePath('/vehicles');
  revalidatePath(`/vehicles/${id}`);
  return { success: true, data: undefined };
}
