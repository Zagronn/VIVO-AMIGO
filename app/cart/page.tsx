'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';

const CART_KEY = 'vivo-amigo-cart';

export default function CartPage() {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => { setItems(JSON.parse(window.localStorage.getItem(CART_KEY) || '[]') as string[]); }, []);
  const remove = (index: number) => setItems((current) => {
    const next = current.filter((_, itemIndex) => itemIndex !== index);
    window.localStorage.setItem(CART_KEY, JSON.stringify(next));
    return next;
  });
  const clear = () => { window.localStorage.removeItem(CART_KEY); setItems([]); };
  return <main className="vivo-public-shell min-h-screen px-4 py-8 text-white sm:px-6"><div className="mx-auto max-w-3xl"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#FFB38A]"><ArrowLeft size={16} />Marketplace</Link><header className="mt-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.16em] text-[#FF6A00]">PREVIEW CART</p><h1 className="mt-2 text-3xl font-extrabold">Saved items</h1><p className="mt-2 text-sm text-white/60">Purchases and payments will be available at public launch.</p></div>{items.length > 0 && <button type="button" onClick={clear} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white/75">Clear all</button>}</header><section className="vivo-glass-panel mt-6 rounded-xl p-4">{items.length === 0 ? <div className="grid min-h-48 place-items-center text-center"><div><ShoppingBag className="mx-auto text-[#FF6A00]" size={28} /><p className="mt-4 text-sm text-white/60">Your preview cart is empty.</p><Link href="/" className="mt-5 inline-block rounded-lg bg-[#FF6A00] px-4 py-3 text-xs font-bold">Explore marketplace</Link></div></div> : <div className="space-y-3">{items.map((item, index) => <article key={`${item}-${index}`} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/15 p-4"><strong className="text-sm">{item}</strong><button type="button" onClick={() => remove(index)} aria-label={`Remove ${item}`} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/70 hover:border-red-300/50 hover:text-red-200"><Trash2 size={16} /></button></article>)}</div>}</section></div></main>;
}
