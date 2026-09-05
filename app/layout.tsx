import type { Metadata } from 'next';
import React, { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'VIVO AMIGO | Mercado Digital Guatemala',
  description: 'Compra, venta, servicios y vehículos con Escrow seguro en Guatemala.',
  icons: {
    icon: '/brand-mark.svg',
    apple: '/brand-mark.svg'
  },
  openGraph: {
    title: 'VIVO AMIGO | Mercado Digital',
    description: 'Compra, venta, servicios y vehículos con Escrow seguro en Guatemala.',
    images: ['/brand-mark.svg'],
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
