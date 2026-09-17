'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createSession, destroySession } from '@/lib/session';
import { registerSchema, loginSchema, safeRedirectPath } from '@/lib/validation';
import type { ActionResult } from '@/actions/reviews';

export async function registerUser(formData: FormData): Promise<ActionResult | never> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid details.' };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'An account with that email already exists.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { name, email, passwordHash },
  });

  await createSession(user.id);
  redirect(safeRedirectPath(formData.get('next')));
}

export async function loginUser(formData: FormData): Promise<ActionResult | never> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid details.' };
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: 'Incorrect email or password.' };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: 'Incorrect email or password.' };
  }

  await createSession(user.id);
  redirect(safeRedirectPath(formData.get('next')));
}

export async function logoutUser(): Promise<never> {
  await destroySession();
  redirect('/');
}
