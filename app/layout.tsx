import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import React, { ReactNode } from 'react';
import { GlobalServiceHeader } from '../components/GlobalServiceHeader';
import { GlobalFooter } from '../components/GlobalFooter';
import { PublicLaunchNotice } from '../components/PublicLaunchNotice';
import { SiteConfigEffects } from '../components/SiteConfigEffects';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-montserrat'
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://vivoamigo.com'),
  title: 'VIVO AMIGO | Digital Marketplace Guatemala',
  description: 'VIVO AMIGO public marketplace preview for products, services, jobs, property, and vehicles in Guatemala.',
  icons: {
    icon: '/brand-mark.svg',
    apple: '/brand-mark.svg'
  },
  openGraph: {
    title: 'VIVO AMIGO | Digital Marketplace Guatemala',
    description: 'VIVO AMIGO public marketplace preview for products, services, jobs, property, and vehicles in Guatemala.',
    images: ['/brand-mark.svg'],
    locale: 'es_GT',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body className="font-sans bg-[#F8F9FA] text-[#111111] antialiased"><SiteConfigEffects /><GlobalServiceHeader /><PublicLaunchNotice />{children}<GlobalFooter /><Analytics /></body>
    </html>
  );
}
