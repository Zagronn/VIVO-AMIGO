'use server';

import { db } from '@/lib/db';
import { contactMessageSchema } from '@/lib/validation';
import type { ActionResult } from '@/actions/reviews';

/**
 * Saves a contact-form submission. Deliberately open to signed-out visitors
 * (no getCurrentUser check) — this is the general "reach the team" form, not
 * a per-user action, and ContactMessage has no user relation.
 */
export async function submitContactMessage(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const parsed = contactMessageSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Please check the form and try again.' };
  }

  try {
    const created = await db.contactMessage.create({ data: parsed.data });
    return { success: true, data: { id: created.id } };
  } catch (error) {
    console.error('Failed to save contact message:', error);
    return { success: false, error: 'Something went wrong sending your message. Please try again shortly.' };
  }
}
