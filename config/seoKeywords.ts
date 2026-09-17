export interface KeywordStrategy {
  slug: string;
  intent: 'HIGH_BUYING_INTENT' | 'INFORMATIONAL';
  targetCategory: string;
  metaTitle: string;
  metaDescription: string;
  cpcValueUSD: number;
}

export const GUATEMALA_SEO_KEYWORD_MAP: KeywordStrategy[] = [
  {
    slug: 'soldadoras-usadas-guatemala',
    intent: 'HIGH_BUYING_INTENT',
    targetCategory: 'CONSTRUCTION',
    metaTitle: 'Soldadoras Usadas en Guatemala | Precios de Remate en VIVO AMIGO',
    metaDescription: 'Encuentra soldadoras e inversores de soldadura al mejor precio en Guatemala. Contacto directo por WhatsApp con vendedores en tu zona.',
    cpcValueUSD: 1.20
  },
  {
    slug: 'pickup-toyota-hilux-zona-10',
    intent: 'HIGH_BUYING_INTENT',
    targetCategory: 'VEHICLES',
    metaTitle: 'Pickups Toyota Hilux Usados en Zona 10 | VIVO AMIGO',
    metaDescription: 'Venta de pickups Toyota Hilux en Zona 10 y todo Guatemala. Trato directo, sin intermediarios. ¡Escríbeles por WhatsApp!',
    cpcValueUSD: 1.10
  },
  {
    slug: 'fletes-baratos-guatemala-zona-1',
    intent: 'HIGH_BUYING_INTENT',
    targetCategory: 'CARGO_SERVICES',
    metaTitle: 'Fletes y Mudanzas Económicas en Zona 1 | CARGO VIVO',
    metaDescription: 'Servicio de flete exprés y transporte de carga pesada en Guatemala. Cotiza al instante vía WhatsApp.',
    cpcValueUSD: 0.95
  }
];
