'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { createJobListingSchema } from '@/lib/validation';
import type { ActionResult } from '@/actions/reviews';

/** Any signed-in user can post a job listing — no vendor approval needed. */
export async function createJobListing(formData: FormData): Promise<ActionResult<{ id: string }>> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, error: 'Sign in to post a job.' };
  }

  const parsed = createJobListingSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    company: formData.get('company'),
    location: formData.get('location'),
    employmentType: formData.get('employmentType'),
    salaryMin: formData.get('salaryMin') || undefined,
    salaryMax: formData.get('salaryMax') || undefined,
    // An unchecked checkbox is simply absent from FormData, so this
    // correctly evaluates to `false` in that case.
    remote: formData.get('remote') === 'on',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid job details.' };
  }

  const { title, description, company, location, employmentType, salaryMin, salaryMax, remote } = parsed.data;

  const listing = await db.jobListing.create({
    data: {
      posterId: user.id,
      title,
      description,
      company,
      location,
      employmentType,
      salaryMin: salaryMin ?? null,
      salaryMax: salaryMax ?? null,
      remote,
    },
  });

  revalidatePath('/jobs');
  return { success: true, data: { id: listing.id } };
}

/** The poster (or an admin) toggles a job listing active/inactive. */
export async function toggleJobListingActive(formData: FormData): Promise<ActionResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, error: 'Sign in to manage job listings.' };
  }

  const id = formData.get('id') as string | null;
  if (!id) {
    return { success: false, error: 'Missing job listing.' };
  }

  const listing = await db.jobListing.findUnique({ where: { id } });
  if (!listing) {
    return { success: false, error: 'Job listing not found.' };
  }

  if (listing.posterId !== user.id && user.role !== 'ADMIN') {
    return { success: false, error: 'You can only manage your own job listings.' };
  }

  await db.jobListing.update({
    where: { id },
    data: { isActive: !listing.isActive },
  });

  revalidatePath('/jobs');
  revalidatePath(`/jobs/${id}`);
  return { success: true, data: undefined };
}
