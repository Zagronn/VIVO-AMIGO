export const ADMIN_OWNER_KEY = 'vivo-super-admin-owner';
export const ADMIN_SESSION_KEY = 'vivo-super-admin-session';

type Owner = { name: string; email: string; salt: string; passwordHash: string };

const bytesToHex = (bytes: Uint8Array) => Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
const hash = async (value: string) => bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));

export const ownerExists = () => typeof window !== 'undefined' && Boolean(localStorage.getItem(ADMIN_OWNER_KEY));
export const activeSession = () => typeof window !== 'undefined' && localStorage.getItem(ADMIN_SESSION_KEY) === 'SERDAR CEVIK';
export const registerOwner = async (name: string, email: string, password: string) => {
  if (name.trim().toUpperCase() !== 'SERDAR CEVIK') throw new Error('Only SERDAR CEVIK can create this Super Admin account.');
  if (ownerExists()) throw new Error('The Super Admin account is already registered on this device.');
  const salt = crypto.randomUUID();
  const owner: Owner = { name: 'SERDAR CEVIK', email: email.trim().toLowerCase(), salt, passwordHash: await hash(`${salt}:${password}`) };
  localStorage.setItem(ADMIN_OWNER_KEY, JSON.stringify(owner));
};
export const loginOwner = async (email: string, password: string) => {
  const stored = localStorage.getItem(ADMIN_OWNER_KEY);
  if (!stored) throw new Error('Create your Super Admin account first.');
  const owner = JSON.parse(stored) as Owner;
  if (owner.email !== email.trim().toLowerCase() || owner.passwordHash !== await hash(`${owner.salt}:${password}`)) throw new Error('Email or password is incorrect.');
  localStorage.setItem(ADMIN_SESSION_KEY, 'SERDAR CEVIK');
};
