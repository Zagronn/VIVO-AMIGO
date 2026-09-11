'use client';

import { FormEvent, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), accessKey: form.get('accessKey'), password: form.get('password') }) });
    if (!response.ok) return setError('Access was not granted.');
    window.location.assign('/admin');
  };
  return <main className="vivo-public-shell grid min-h-screen place-items-center p-4 text-white"><form onSubmit={submit} className="vivo-glass-dialog w-full max-w-md rounded-xl p-7"><ShieldCheck className="text-[#FF6A00]" size={28} /><p className="mt-6 text-xs font-bold tracking-[.16em] text-[#FF6A00]">VIVO AMIGO</p><h1 className="mt-2 text-3xl font-extrabold">Super Admin registration</h1><p className="mt-2 text-sm text-white/60">Single-owner secure workspace.</p>{error && <p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}<label className="mt-6 block text-xs font-bold text-white/70">Full name<input name="name" defaultValue="SERDAR CEVIK" required className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm" /></label><label className="mt-4 block text-xs font-bold text-white/70">Admin key<input name="accessKey" defaultValue="SUPER ADMIN" required className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm" /></label><label className="mt-4 block text-xs font-bold text-white/70">Your password<input name="password" type="password" autoComplete="current-password" required className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm" /></label><button className="mt-6 w-full rounded-lg bg-[#FF6A00] px-4 py-3 text-sm font-bold">Enter secure workspace</button></form></main>;
}
