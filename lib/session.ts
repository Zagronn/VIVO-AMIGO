import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from '@/lib/db';

const SESSION_COOKIE = 'vivo_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

/** Generates an unguessable, URL-safe session token. */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Creates a session row for the given user and sets the httpOnly cookie.
 * Call this right after a successful login or registration.
 */
export async function createSession(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.session.create({
    data: { token, userId, expiresAt },
  });

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

/** Reads the session cookie and returns the logged-in user, or null. */
export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: { include: { vendorProfile: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      // Clean up expired session rows lazily.
      await db.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  return session.user;
}

/** Throws-free helper for actions/pages that require a logged-in user. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('NOT_AUTHENTICATED');
  }
  return user;
}

/** Throws-free helper for actions/pages that require an admin. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'ADMIN') {
    throw new Error('NOT_AUTHORIZED');
  }
  return user;
}

/** Throws-free helper for actions/pages that require an active (approved) vendor. */
export async function requireActiveVendor() {
  const user = await requireUser();
  if (!user.vendorProfile || user.vendorProfile.status !== 'ACTIVE') {
    throw new Error('NOT_ACTIVE_VENDOR');
  }
  return { user, vendorProfile: user.vendorProfile };
}

/** Deletes the current session, both the cookie and the DB row. */
export async function destroySession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.delete({ where: { token } }).catch(() => {});
  }
  cookies().delete(SESSION_COOKIE);
}
