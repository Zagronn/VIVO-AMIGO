'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireActiveVendor } from '@/lib/session';
import { createProductSchema } from '@/lib/validation';
import type { ActionResult } from '@/actions/reviews';

/** An active (approved) vendor lists a new product. */
export async function createProduct(formData: FormData): Promise<ActionResult<{ productId: string }>> {
  let vendorProfile;
  try {
    ({ vendorProfile } = await requireActiveVendor());
  } catch {
    return { success: false, error: 'Only an approved seller can list products.' };
  }

  const parsed = createProductSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || '',
    price: formData.get('price'),
    stockQuantity: formData.get('stockQuantity') || 0,
    categoryId: formData.get('categoryId') || '',
    imageUrl: formData.get('imageUrl'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid product details.' };
  }

  const { title, description, price, stockQuantity, categoryId, imageUrl } = parsed.data;

  const product = await db.product.create({
    data: {
      vendorId: vendorProfile.id,
      title,
      description: description || null,
      price,
      stockQuantity,
      categoryId: categoryId || null,
      images: [imageUrl],
    },
  });

  revalidatePath('/vendor/dashboard');
  revalidatePath('/products');
  return { success: true, data: { productId: product.id } };
}

/** An active vendor toggles one of their own products active/inactive. */
export async function toggleProductActive(formData: FormData): Promise<ActionResult> {
  let vendorProfile;
  try {
    ({ vendorProfile } = await requireActiveVendor());
  } catch {
    return { success: false, error: 'Only an approved seller can manage products.' };
  }

  const productId = formData.get('productId') as string | null;
  if (!productId) {
    return { success: false, error: 'Missing product.' };
  }

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || product.vendorId !== vendorProfile.id) {
    return { success: false, error: 'Product not found.' };
  }

  await db.product.update({
    where: { id: productId },
    data: { isActive: !product.isActive },
  });

  revalidatePath('/vendor/dashboard');
  revalidatePath('/products');
  return { success: true, data: undefined };
}
