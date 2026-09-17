export interface SystemArchitectureConfig {
  backend: 'Node.js (TypeScript) / ASP.NET Core 9.0';
  databases: { primary: 'PostgreSQL'; cachingOTP: 'Redis'; searchEngine: 'Elasticsearch' };
  apiIntegrations: {
    payments: 'Visanet Guatemala / NeoNet API';
    banking: 'Banco Industrial / Banrural SDK';
    logistics: 'Cargo Expreso / GuateEx / CARGO VIVO';
    identity: 'RENAP Guatemala API';
    edge: 'Cloudflare Workers / D1 / KV / R2 / Vectorize';
  };
  deployment: { region: 'AWS us-east-1 (N. Virginia)'; waf: 'Cloudflare Enterprise'; roadmapWeeks: 12 };
}

export const VIVO_AMIGO_ARCHITECTURE: SystemArchitectureConfig = {
  backend: 'Node.js (TypeScript) / ASP.NET Core 9.0',
  databases: { primary: 'PostgreSQL', cachingOTP: 'Redis', searchEngine: 'Elasticsearch' },
  apiIntegrations: {
    payments: 'Visanet Guatemala / NeoNet API',
    banking: 'Banco Industrial / Banrural SDK',
    logistics: 'Cargo Expreso / GuateEx / CARGO VIVO',
    identity: 'RENAP Guatemala API',
    edge: 'Cloudflare Workers / D1 / KV / R2 / Vectorize'
  },
  deployment: { region: 'AWS us-east-1 (N. Virginia)', waf: 'Cloudflare Enterprise', roadmapWeeks: 12 }
};

export const getSystemArchitecture = (): SystemArchitectureConfig => ({
  ...VIVO_AMIGO_ARCHITECTURE,
  databases: { ...VIVO_AMIGO_ARCHITECTURE.databases },
  apiIntegrations: { ...VIVO_AMIGO_ARCHITECTURE.apiIntegrations },
  deployment: { ...VIVO_AMIGO_ARCHITECTURE.deployment }
});
