# VIVO-MERCADO Platform Architecture

## Scope

VIVO-MERCADO is the scalable orchestration layer for `vivoamigo.com`, `payvivoamigo.com`, and `cargovivo.com`. Guatemala (`GT`) is the first market; the corridor model is extensible to Mexico, Colombia, Peru, Chile, and Brazil without changing the trust boundaries.

## Request Flow

1. `vivoamigo.com` receives the listing, buyer, supplier, and consent context.
2. VERI-SHIELD validates identity, source, valuation, price corridor, and threat state.
3. VivoScore is queried only with explicit consent through a provider adapter.
4. `payvivoamigo.com` creates the currency-aware, idempotent escrow intent.
5. `cargovivo.com` owns shipment, inspection, and proof-of-delivery events.
6. Escrow release remains gated by inspection, delivery, dispute, and emergency-lock checks.

## Trust Boundaries

- No raw PAN, biometric template, or unmasked DPI crosses the marketplace boundary.
- Provider adapters are server-side and fail closed when credentials or APIs are unavailable.
- Bank credit is a provider decision, not a platform guarantee.
- Currency conversion requires a separately approved FX provider; no implicit exchange rate is invented.
- Every financial operation carries currency, idempotency key, status, timestamp, and audit context.

## Scale Model

Country and currency support is represented by corridor configuration. Partner-specific adapters can be added for banks, wallets, carriers, and registries without coupling their credentials or data stores. Regional rollout requires local privacy, consumer, payments, import/export, and tax review per country.

## Operational Gates

`npm test`, security audit, provider contract tests, consent review, data protection review, incident runbook, and rollback evidence are required before activating a new corridor. “Zero-trust” describes enforced controls, not a promise of zero fraud or zero operational risk.