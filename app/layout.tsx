import type { Metadata } from 'next';
import React, { ReactNode } from 'react';

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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
