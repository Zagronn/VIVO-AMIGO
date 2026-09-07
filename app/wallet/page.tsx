import { VivoWalletSystem } from '@/components/VivoWalletSystem';

export const metadata = {
  title: 'VivoWallet | payvivoamigo.com',
  description: 'VivoWallet, VIVO-CHECK escrow and partner finance workflows.',
  alternates: { canonical: 'https://payvivoamigo.com/wallet' }
};

export default function WalletPage() {
  return <VivoWalletSystem userId="wallet-session-user" />;
}