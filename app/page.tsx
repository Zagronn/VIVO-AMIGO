import { headers } from 'next/headers';
import { VivoMarketplaceHomeI18n } from '../components/VivoMarketplaceHomeI18n';
import { VivoPayDashboard } from '../components/VivoPayDashboard';
import { CargoVivoTracking } from '../components/CargoVivoTracking';

export default async function HomePage() {
  const host = (await headers()).get('host')?.split(':')[0].toLowerCase();
  if (host === 'cargovivo.com' || host === 'www.cargovivo.com') return <CargoVivoTracking />;
  if (host === 'payvivoamigo.com' || host === 'www.payvivoamigo.com') return <VivoPayDashboard />;
  return <VivoMarketplaceHomeI18n />;
}
