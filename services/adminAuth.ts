export const checkIsSuperAdmin = (): boolean => {
  const userRole = localStorage.getItem('vivo_user_role');
  const authToken = localStorage.getItem('vivo_auth_token');
  return Boolean(authToken && userRole === 'SUPER_ADMIN');
};
