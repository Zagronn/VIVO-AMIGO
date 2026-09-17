'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { applyVendorSchema, vendorIdSchema } from '@/lib/validation';
import type { ActionResult } from '@/actions/reviews';

/** A signed-in customer applies to become a vendor (starts PENDING). */
export async function applyToBecomeVendor(formData: FormData): Promise<ActionResult<{ vendorId: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Sign in to apply as a seller.' };
  }
  if (user.vendorProfile) {
    return { success: false, error: `You already have a seller application (${user.vendorProfile.status}).` };
  }

  const parsed = applyVendorSchema.safeParse({ storeName: formData.get('storeName') });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid store name.' };
  }

  const vendor = await db.vendorProfile.create({
    data: { userId: user.id, storeName: parsed.data.storeName },
  });

  revalidatePath('/sell');
  revalidatePath('/admin/dashboard');
  return { success: true, data: { vendorId: vendor.id } };
}

/** Admin approves a pending vendor application. */
export async function approveVendor(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Only an admin can approve vendors.' };
  }

  const parsed = vendorIdSchema.safeParse({ vendorId: formData.get('vendorId') });
  if (!parsed.success) {
    return { success: false, error: 'Invalid vendor.' };
  }

  await db.vendorProfile.update({
    where: { id: parsed.data.vendorId },
    data: { status: 'ACTIVE' },
  });

  revalidatePath('/admin/dashboard');
  return { success: true, data: undefined };
}

/** Admin suspends an active (or pending) vendor. */
export async function suspendVendor(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Only an admin can suspend vendors.' };
  }

  const parsed = vendorIdSchema.safeParse({ vendorId: formData.get('vendorId') });
  if (!parsed.success) {
    return { success: false, error: 'Invalid vendor.' };
  }

  await db.vendorProfile.update({
    where: { id: parsed.data.vendorId },
    data: { status: 'SUSPENDED' },
  });

  revalidatePath('/admin/dashboard');
  return { success: true, data: undefined };
}
