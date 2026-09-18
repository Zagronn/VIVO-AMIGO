'use client';

import { signIn } from 'next-auth/react';

export function GoogleSignInButton() {
  return (
    <button
      onClick={() => signIn('google', { callbackUrl: '/' })}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-vivo-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-vivo-black transition hover:bg-vivo-black/5 active:scale-95"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.5 10V14H15" />
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
        <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      </svg>
      Continue with Google
    </button>
  );
}
