export interface VivoAmigoInfrastructure {
  backend: 'Node.js (TypeScript) / ASP.NET Core 9.0';
  databases: {
    primary: 'PostgreSQL';
    cachingOTP: 'Redis';
    searchEngine: 'Elasticsearch';
  };
  security: {
    pciDssCompliance: boolean;
    wafProvider: 'Cloudflare Enterprise';
    hostingRegion: 'AWS us-east-1 (N. Virginia)';
  };
  integrations: {
    payments: 'Visanet Guatemala / NeoNet API';
    banking: 'Banco Industrial / Banrural SDK';
    logistics: 'Cargo Expreso / GuateEx / CARGO VIVO';
    identityVerification: 'RENAP Guatemala API';
  };
}

export const getInfrastructureStatus = (): VivoAmigoInfrastructure => ({
  backend: 'Node.js (TypeScript) / ASP.NET Core 9.0',
  databases: {
    primary: 'PostgreSQL',
    cachingOTP: 'Redis',
    searchEngine: 'Elasticsearch'
  },
  security: {
    pciDssCompliance: true,
    wafProvider: 'Cloudflare Enterprise',
    hostingRegion: 'AWS us-east-1 (N. Virginia)'
  },
  integrations: {
    payments: 'Visanet Guatemala / NeoNet API',
    banking: 'Banco Industrial / Banrural SDK',
    logistics: 'Cargo Expreso / GuateEx / CARGO VIVO',
    identityVerification: 'RENAP Guatemala API'
  }
});
