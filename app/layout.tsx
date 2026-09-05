import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React, { ReactNode } from 'react';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'VIVO AMIGO | Mercado Digital Guatemala',
  description: 'Compra, venta, servicios y vehículos con Escrow seguro en Guatemala.',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png'
  },
  openGraph: {
    title: 'VIVO AMIGO | Mercado Digital',
    description: 'Compra, venta, servicios y vehículos con Escrow seguro en Guatemala.',
    images: ['/images/logo.png'],
    locale: 'es_GT',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans bg-[#E3E6E6] text-slate-900 antialiased">{children}</body>
    </html>
  );
}
