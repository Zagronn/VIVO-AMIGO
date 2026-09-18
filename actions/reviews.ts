'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { reviewSchema } from '@/lib/validation';

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Creates a review for a product.
 *
 * Hardened vs. the original draft:
 *  - userId comes from the server-side session, never from the form body
 *    (a client can't spoof someone else's review this way).
 *  - Input is validated with zod instead of ad-hoc parseInt checks.
 *  - The product is confirmed to exist before writing the review, so a bad
 *    productId fails with a clear message instead of a generic DB error.
 */
export async function createProductReview(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'You need to be signed in to leave a review.' };
  }

  const parsed = reviewSchema.safeParse({
    productId: formData.get('productId'),
    rating: formData.get('rating'),
    comment: formData.get('comment'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid review.' };
  }

  const { productId, rating, comment } = parsed.data;

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return { success: false, error: 'That product no longer exists.' };
  }

  try {
    const review = await db.review.create({
      data: { userId: user.id, productId, rating, comment },
    });

    revalidatePath(`/products/${productId}`);
    return { success: true, data: { id: review.id } };
  } catch (error: any) {
    // Prisma unique-constraint violation (userId+productId) => duplicate review.
    if (error?.code === 'P2002') {
      return { success: false, error: 'You have already reviewed this product.' };
    }
    console.error('Failed to create review:', error);
    return { success: false, error: 'Something went wrong saving your review.' };
  }
}
