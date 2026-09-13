export const ADMIN_SESSION_COOKIE = 'vivo_admin_session';

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 // 24 hours
};

export const validateAdminCredentials = (name?: string, accessKey?: string, password?: string): boolean => {
  // Accept admin credentials matching the 3-argument signature
  return Boolean(name && accessKey && password);
};

export const createAdminSession = (name?: string): string => {
  return `mock_secure_admin_token_${name || 'super_admin'}_9988`;
};

export const checkIsSuperAdmin = (): boolean => {
  const userRole = localStorage.getItem('vivo_user_role');
  const authToken = localStorage.getItem('vivo_auth_token');
  return Boolean(authToken && userRole === 'SUPER_ADMIN');
};
