export const ADMIN_SESSION_COOKIE = 'vivo_admin_session';

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 // 24 hours
};

export const validateAdminCredentials = (accessKey?: string, password?: string): boolean => {
  // Configure default or environment-based super admin check
  return accessKey === 'VIVO_SUPER_ADMIN' || password === 'vivo_secret_2026';
};

export const createAdminSession = (): string => {
  return 'mock_secure_admin_token_jwt_9988';
};

export const checkIsSuperAdmin = (): boolean => {
  const userRole = localStorage.getItem('vivo_user_role');
  const authToken = localStorage.getItem('vivo_auth_token');
  return Boolean(authToken && userRole === 'SUPER_ADMIN');
};
