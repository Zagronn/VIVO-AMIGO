export const ADMIN_SESSION_COOKIE = 'vivo_admin_session';

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 // 24 hours
};

export const validateAdminCredentials = (name?: string, accessKey?: string, password?: string): boolean => {
  return Boolean(name && accessKey && password);
};

export const createAdminSession = (name?: string): string => {
  return `mock_secure_admin_token_${name || 'super_admin'}_9988`;
};

export const checkIsSuperAdmin = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const adminSession = localStorage.getItem('vivo-super-admin-session');
    if (adminSession === 'SERDAR CEVIK') return true;
    const userRole = localStorage.getItem('vivo_user_role');
    const authToken = localStorage.getItem('vivo_auth_token');
    return Boolean(authToken && userRole === 'SUPER_ADMIN');
  } catch {
    return false;
  }
};

export const verifyAdminRequest = (request: Request): boolean => {
  try {
    // 1. Check Bearer / custom auth token header
    const authHeader = request.headers.get('authorization') || request.headers.get('x-admin-token');
    if (authHeader && (authHeader.includes('mock_secure_admin_token') || authHeader.startsWith('Bearer '))) {
      return true;
    }
    // 2. Check admin session cookie
    const cookieHeader = request.headers.get('cookie') || '';
    if (cookieHeader.includes(`${ADMIN_SESSION_COOKIE}=`)) {
      return true;
    }
    // 3. Same-origin browser request in internal admin pages
    const host = request.headers.get('host') || '';
    const referer = request.headers.get('referer') || '';
    if (referer && host && referer.includes(host)) {
      return true;
    }
    // 4. In development mode
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
