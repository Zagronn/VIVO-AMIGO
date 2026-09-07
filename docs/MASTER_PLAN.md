# VIVO AMIGO Guatemala Master Plan

**Status:** Architecture and implementation blueprint
**Launch pilot:** Guatemala City, Zones 10, 14, and 15
**First vertical:** Construction and industrial equipment
**Core suite:** VIVO AMIGO, VIVOAMIGOPAY, CARGO VIVO, VERI-SHIELD

## Mission

VIVO AMIGO is a trusted commerce operating layer for Guatemala: verified corporate supply, transparent marketplace discovery, VIVOAMIGOPAY escrow, CARGO VIVO delivery, and auditable evidence from listing to settlement.

This plan defines technical controls and measurable workflows. It does not claim zero fraud, legal enforceability without qualified providers, PCI certification, government endorsement, or lending authority until those external controls and credentials are actually verified.

## Architecture

- **Web/PWA:** Next App Router surfaces, vanilla offline PWA shell, Inter/Amazon-compatible typography, VA Shield branding.
- **Backend:** Node.js TypeScript services with an ASP.NET Core 9 project shell for enterprise APIs.
- **Data:** PostgreSQL/pgvector for relational and semantic listing search; Redis for OTP/cache; DynamoDB for serverless listing access; Cloudflare D1/KV/R2/Vectorize at the edge.
- **Security:** VERI-SHIELD identity adapters, KYC gates, token-only card handling, consent shield, blacklist risk engine, admin approval audit.
- **Operations:** AWS `us-east-1` target, Cloudflare Enterprise edge/WAF target, CARGO carrier integrations, Visanet/NeoNet and bank adapters behind credentials.

## VIVO-CHECK secure transaction

1. Buyer generates a `VIVO-####-GT` session for a listing.
2. A 1% temporary hold is calculated from the listing price.
3. Seller verifies the code on site; the session moves from `PENDING_MATCH` to `VERIFIED_ON_SITE`.
4. Contract, KYC, inspection, and escrow rules remain authoritative before delivery or release.
5. Disputes never auto-release funds; every release requires delivery/acceptance evidence.

## CARGO VIVO logistics

- Shipment states: created, in transit, delivered, cancelled.
- Carrier coverage: Cargo Expreso, GuateEx, and CARGO VIVO.
- Delivery escrow uses a 24-hour hold after confirmed delivery before payout approval.
- Fleet telematics monitors speed, deducts five safety points for overspeeding, and emits “Transportamos Vidas” alerts.
- Driver verification exposes DPI trust, plate, safety score, delivery count, GPS tracking, and escrow status.
- VIVO-ASSIST provides fixed-price roadside help for tow truck, flat tire, battery jump, and fuel delivery with GPS dispatch and escrow messaging.

## VIVO-ASSIST fixed pricing

| Service | Base GTQ | Per km GTQ |
| --- | ---: | ---: |
| Tow truck | 250 | 12 |
| Flat tire | 100 | 5 |
| Battery jump | 80 | 5 |
| Fuel delivery | 75 | 5 |

Prices are calculated server-side and rounded to whole GTQ. Distance, coordinates, user ID, and issue type are validated before dispatch.

## VIVO-VERIFY and inspection

High-value vehicle, machinery, and industrial equipment listings can receive a motorized field inspection. Required gates are paint thickness, OBD diagnostics, and tamper-proof QR issuance. Approved reports receive an `APPROVED_SEALED` status and canonical verification URL; failed reports are `REJECTED`.

The admin dashboard must show inspection ID, QR/PDF evidence, score, inspector identity, seal status, and approval history. A seal does not replace a title, notarial act, professional appraisal, or government record.

## Corporate and property trust chain

- Sellers need Registro Mercantil, NIT/tax evidence, and admin-approved corporate verification before corporate inventory publication.
- Real-estate listings require Libertad de Gravamen, notarized title, and location proof.
- OCR can extract date, seal, zone, and area, but mismatches go to manual review.
- Signed contracts, funded escrow, admin approval, and delivery/notary evidence are required before release or completion codes.

## VIVOAMIGOPAY and monetization

- Individual listings: first two eligible vehicle/real-estate listings free; subsequent charges are plan-controlled.
- Professional merchants: monthly plans plus 50-100 bps success fee.
- Services: fixed bid fee or 500-1000 bps success fee.
- Wholesale: Gold membership and plan-controlled settlement fee.
- Escrow: 200-500 bps service fee, disclosed before checkout.
- BYD/direct partner leads: attribution and partner payout tracked separately.
- All rates are stored in basis points and currency on the transaction record; use idempotency keys for charging and settlement.

## Privacy and data monetization

Predictive marketing requires explicit privacy terms and data monetization consent. Only masked phone hashes and minimized behavior signals may enter campaign segmentation. Personalized offers are sponsor-labeled, WhatsApp allowlisted, auditable, and never presented without consent.

## PCI/card security

- Browser components never receive raw card numbers.
- Visanet/NeoNet adapters own tokenization and 3DS authorization.
- DPI/card name matching and expiry checks occur server-side.
- Bid holds use token references; fraud penalties are auditable and separated from card data.

## SEO and marketplace acquisition

Canonical high-intent pages include rentals in Zone 10, affordable used vehicles, economical freight, professional construction services, soldadoras, Hilux, and local supplier inventory. Sitemap routes are generated from the Guatemala keyword strategy.

## 12-week roadmap

1. **Weeks 1-2:** Corporate verification, KYC, admin roles, consent, audit events.
2. **Weeks 3-4:** Construction equipment pilot, VIVO-VERIFY field operations, inspection QR/PDF.
3. **Weeks 5-6:** VIVOAMIGOPAY escrow, signed contracts, CARGO delivery and release gates.
4. **Weeks 7-8:** Fleet telematics, VIVO-ASSIST, driver QR verification, carrier integrations.
5. **Weeks 9-10:** B2B supplier matching, payvivoamigo.com referral packets, analytics with privacy controls.
6. **Weeks 11-12:** Vehicle/real-estate expansion, SEO scale-up, regional rollout readiness.

## Release gates

Before expanding the pilot, verify active corporate supply, inspection turnaround, escrow delivery/release, dispute handling, fee reconciliation, fraud false-positive rate, and privacy consent coverage. Build, platform SDK, cloud deployment, payment gateway, government adapter, and signing checks must be reported as unavailable rather than simulated when their tools or credentials are absent.

## Strategic Engineering Notes

### Viral incentive algorithm

The default campaign policy begins at a 450 BPS (4.5%) commission. A verified social share and a completed PayVivo wallet payment can each reduce the applied rate through the versioned `viralIncentiveEngine`; discounts are bounded at zero and are recorded with transaction and campaign IDs. This creates a measurable referral loop without treating unverified posts or wallet claims as rewards.

### Asset-light and scalable architecture

VIVO-MERCADO owns trust, transaction state, evidence, and partner orchestration rather than physical inventory. Warehousing, transport, bank underwriting, and telecom distribution remain adapter-backed partner capabilities. New countries add corridor configuration, local currency, compliance policy, and provider adapters rather than duplicating the core ledger.

### Digital barter and circular value

Partner media, payment discovery, and logistics placement can be exchanged in a capped, consent-gated pilot. “Zero budget” means zero upfront media target, not zero operating cost or guaranteed sponsorship. Barter, revenue share, exclusivity, and data-sharing require signed terms.

| Criterion | Typical classifieds | VIVO-MERCADO |
| --- | --- | --- |
| Trust | Seller-led, variable evidence | VERI-SHIELD, VIVO-VERIFY, audit gates |
| Payment | Cash or external link | PayVivo wallet and escrow intent |
| Speed | Manual coordination | Adapter-backed score and workflow status |
| Marketing | Purchased inventory | Consent-gated viral and partner pilots |
