import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'VIVO AMIGO — Marketplace for Latin America',
  description:
    'VIVO AMIGO is a Latin American marketplace ecosystem — shop products, and explore VIVO PAY, VIVO SHIP, VIVO ADS, VIVO BUSINESS and VIVO SUPPORT.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`flex min-h-screen flex-col font-sans ${montserrat.variable}`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
