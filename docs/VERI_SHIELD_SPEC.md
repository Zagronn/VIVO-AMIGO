# VERI-SHIELD Fair-Price Specification

## Purpose

The Dynamic Market Value (DVM) engine establishes a transparent price corridor for vivoamigo.com listings. It protects buyers from abusive pricing while allowing sellers to publish a price above the corridor with a visible disclosure and human-reviewable evidence.

## Price Corridor Algorithm

For an asset, the server resolves an approved market range:

- `minMarketValue`: lower bound from the approved comparable-set model.
- `maxMarketValue`: upper bound from the approved comparable-set model.
- `hardCapPrice = maxMarketValue * 1.20`.

The asking price is classified as:

1. **FAIR:** `minMarketValue <= askingPrice <= maxMarketValue`.
2. **ABOVE_MARKET:** `maxMarketValue < askingPrice <= hardCapPrice`. The listing may proceed with a clear buyer-facing disclosure.
3. **PRICE_GOUGING:** `askingPrice > hardCapPrice`. The listing is blocked pending a reviewed exception; the UI must not expose internal fraud scores.

The calculation is server-authoritative. Client controls are explanatory only and cannot bypass publication gates. Every decision stores the model version, comparable-set reference, currency, bounds, asking price, timestamp, and reviewer or policy identity.

## Incentive Engine

Fair-price classification can make a seller eligible for configured incentives such as temporary listing promotion or a campaign commission rate. Eligibility is not a guaranteed reward: the campaign must be active, the seller must satisfy account and consent rules, and the reward must be issued idempotently through the wallet/reward ledger.

## Circular Justice Rules

- Sellers who price within the approved corridor receive transparent access to configured incentives.
- Buyers see an above-market disclosure before engaging with a listing.
- Listings above the hard cap are blocked until reviewed evidence supports an exception.
- The same policy protects a seller when selling and that seller when buying later; no participant receives a hidden price advantage.
- Do not claim that DVM is an appraisal, legal valuation, government decision, or guarantee of market price.
- Appeals must preserve the original decision, evidence, model version, reviewer identity, and final resolution as append-only audit events.

## Data and Safety Controls

- Use aggregate, consent-appropriate inputs and suppress outputs with insufficient comparable samples.
- Keep DPI, bank, device, and location data out of public listing records and model prompts.
- Do not publish a listing solely because the UI displays a fair-price state.
- Use currency-aware arithmetic and persist exact basis assumptions for later audit.