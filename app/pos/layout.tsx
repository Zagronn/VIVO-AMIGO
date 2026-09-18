import type { Metadata } from 'next';
import Link from 'next/link';
import { PosAppShell } from '@/components/PosAppShell';

export const metadata: Metadata = {
  title: 'VIVO POS — Sell anywhere',
  description: 'A lightweight, installable point-of-sale for street sellers and independent shops.',
  manifest: '/manifest.json',
  themeColor: '#FF6A1A',
};

const tabs = [
  { href: '/pos', label: 'Home' },
  { href: '/pos/sell', label: 'Sell' },
  { href: '/pos/catalog', label: 'Catalog' },
  { href: '/pos/sales', label: 'Sales' },
];

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PosAppShell />

      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
        <nav className="glass-card flex gap-1 p-1.5">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="flex-1 rounded-xl px-3 py-2 text-center text-sm font-semibold text-vivo-black/70 hover:bg-white hover:text-vivo-orange"
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      {children}
    </div>
  );
}
