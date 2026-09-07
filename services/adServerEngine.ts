export interface NativeAdOffer {
  id: string;
  categoryMatch: 'VEHICLES' | 'REAL_ESTATE' | 'ELECTRONICS' | 'PAY_VIVO';
  partnerName: string;
  headline: string;
  subtext: string;
  ctaText: string;
  logoUrl: string;
  partnerLink: string;
}

const OFFERS: NativeAdOffer[] = [
  {
    id: 'bi-auto-loan',
    categoryMatch: 'VEHICLES',
    partnerName: 'Banrural Auto Loan',
    headline: 'Explora opciones de crédito para tu vehículo',
    subtext: 'Consulta condiciones con el socio financiero participante.',
    ctaText: 'Calcular crédito',
    logoUrl: '/logos/banrural-logo.png',
    partnerLink: 'https://payvivoamigo.com/loans/bi'
  },
  {
    id: 'banrural-home-loan',
    categoryMatch: 'REAL_ESTATE',
    partnerName: 'Banco Industrial Mortgages',
    headline: 'Conoce opciones para financiar tu inmueble',
    subtext: 'Tasas, elegibilidad y aprobación dependen del socio financiero.',
    ctaText: 'Ver opciones',
    logoUrl: '/logos/bi-logo.png',
    partnerLink: 'https://payvivoamigo.com/loans/banrural'
  },
  {
    id: 'payvivo-wallet',
    categoryMatch: 'PAY_VIVO',
    partnerName: 'PAY VIVO',
    headline: 'Transfiere con una wallet transparente',
    subtext: 'Consulta tarifas y settlement antes de confirmar.',
    ctaText: 'Abrir PAY VIVO',
    logoUrl: '/images/logo.png',
    partnerLink: 'https://payvivoamigo.com/wallet'
  }
];

function safeOffer(offer: NativeAdOffer): NativeAdOffer {
  if (!/^https:\/\//i.test(offer.partnerLink)) throw new Error('partner offer links must use HTTPS');
  return { ...offer };
}

export class AdServerEngine {
  private readonly offers: NativeAdOffer[];

  constructor(offers: NativeAdOffer[] = OFFERS) {
    this.offers = offers.map(safeOffer);
  }

  public getContextualAd(category: string): NativeAdOffer {
    const normalizedCategory = category.trim().toUpperCase();
    const normalized = normalizedCategory === 'VEHICLE' ? 'VEHICLES' : normalizedCategory === 'PROPERTY' ? 'REAL_ESTATE' : normalizedCategory;
    const matched = this.offers.find((offer) => offer.categoryMatch === normalized);
    return { ...(matched || this.offers.find((offer) => offer.categoryMatch === 'PAY_VIVO') || this.offers[0]) };
  }

  public getOffers(): NativeAdOffer[] {
    return this.offers.map((offer) => ({ ...offer }));
  }
}