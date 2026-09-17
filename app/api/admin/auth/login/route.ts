import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, adminCookieOptions, createAdminSession, validateAdminCredentials } from '@/services/adminAuth';

export async function POST(request: Request) {
  const { name, accessKey, password } = await request.json().catch(() => ({}));
  if (typeof name !== 'string' || typeof accessKey !== 'string' || typeof password !== 'string' || !validateAdminCredentials(name, accessKey, password)) return NextResponse.json({ error: 'Invalid administrator credentials.' }, { status: 401 });
  const response = NextResponse.json({ role: 'SUPER_ADMIN' });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(name), adminCookieOptions);
  return response;
}
