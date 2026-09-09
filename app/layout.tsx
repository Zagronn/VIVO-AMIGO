import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import React, { ReactNode } from 'react';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-montserrat'
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://vivoamigo.com'),
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
    <html lang="es" className={montserrat.variable}>
      <body className="font-sans bg-[#F8F9FA] text-[#111111] antialiased">{children}</body>
    </html>
  );
}
