import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_SESSION_COOKIE = 'vivo_admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

type AdminSession = { name: string; role: 'SUPER_ADMIN'; expiresAt: number };
const sessions = new Map<string, AdminSession>();

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
const passwordHash = (password: string, salt: string) => scryptSync(password, salt, 64).toString('hex');

function configuredAdmin() {
  const credential = process.env.VIVO_SUPER_ADMIN_PASSWORD_SCRYPT || process.env.VIVO_ADMIN_PASSWORD_SCRYPT;
  if (!credential) return null;
  const [salt, expected] = credential.split(':');
  if (!salt || !expected) return null;
  return { salt, expected };
}

export function validateAdminCredentials(name: string, accessKey: string, password: string) {
  const admin = configuredAdmin();
  if (!admin || name.trim().toUpperCase() !== 'SERDAR CEVIK' || accessKey.trim().toUpperCase() !== 'SUPER ADMIN') return false;
  const actual = Buffer.from(passwordHash(password, admin.salt), 'hex');
  const expected = Buffer.from(admin.expected, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createAdminSession(name: string) {
  const token = randomBytes(32).toString('base64url');
  sessions.set(hashToken(token), { name: name.trim(), role: 'SUPER_ADMIN', expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

export function revokeAdminSession(token?: string) {
  if (token) sessions.delete(hashToken(token));
}

export async function getAdminSession() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = sessions.get(hashToken(token));
  if (!session || session.expiresAt <= Date.now()) {
    revokeAdminSession(token);
    return null;
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await getAdminSession();
  if (!session || session.role !== 'SUPER_ADMIN') throw new Error('UNAUTHORIZED_ADMIN');
  return session;
}

export const adminCookieOptions = { httpOnly: true, sameSite: 'strict' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_TTL_MS / 1000 };
