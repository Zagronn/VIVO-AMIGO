# vivoamigo Zero Budget Expansion

**Domains:**

- `vivoamigo.com`: listings, services, and marketplace portal.
- `payvivoamigo.com`: VivoWallet, escrow, and partner-finance workflows.
- `cargovivo.com`: logistics, roadside assistance, and carrier network.

**Status:** Strategic proposal and pilot design. Zero-cost distribution, zero-rating, SMS inventory, bank placement, and sponsor funding require signed partner agreements and are not active by this document.

## Three-Leg Growth Loop

### 1. VERI-SHIELD Trust

VERI-SHIELD and the DVM fair-price corridor create auditable trust signals for eligible listings. The system may show OCR, SAT/PNC, inspection, escrow, and price-corridor evidence only when the corresponding provider or internal gate has actually passed.

Campaign language must say “controles verificables” rather than guarantee zero risk. Devin AI and the “Porsuk Reis” campaign symbol can support the creative identity, but neither is a government, bank, insurer, or appraisal authority.

### 2. GSM Partner Exchange

Propose a consent-gated pilot with Tigo and Claro:

- Partner-approved SMS, push, or in-app placements promote selected vivoamigo flows.
- `cargovivo.com` and `payvivoamigo.com` may be allowlisted for a negotiated sponsored-data or zero-rating pilot.
- Tigo Money and Claro payment adapters remain server-side, tokenized, idempotent, and subject to provider approval.
- Attribution uses campaign IDs and aggregate conversion events; raw DPI, payment data, device identifiers, and precise location do not enter campaign audiences.
- Opt-out, frequency caps, message templates, delivery logs, and complaint handling are required before launch.

### 3. Bank Partner Exchange

Propose placement with Banco Industrial/Zigi and Banrural:

- A listing may show an “Anında Kredi Başvurusu” action only when the partner adapter and eligibility policy are configured.
- `payvivoamigo.com` owns the escrow intent and audit state; the bank owns KYC, underwriting, approval, disclosures, servicing, and regulated decisions.
- VIVO-VERIFY and VERI-SHIELD evidence references can reduce repeated document handling but never guarantee approval or eliminate credit risk.
- Bank campaign placement, lead attribution, and any barter or referral terms require written approval.

## Proposed Zero-Cash Pilot Economics

The target is a zero-upfront-media-budget pilot, not a guaranteed `0 GTQ` operating cost. Each party retains its infrastructure, regulatory, support, and compliance costs unless a signed agreement says otherwise.

Potential exchanges:

| vivoamigo contribution | Partner contribution |
| --- | --- |
| Consent-aware marketplace and logistics placement | Approved SMS, push, app, or sponsored-data inventory |
| Verified listing context and campaign attribution | Wallet/payment discovery placement |
| Co-branded educational creative | Bank or GSM customer acquisition distribution |
| Auditable conversion and settlement reporting | Pilot credits, media inventory, or agreed referral economics |

Pilot controls: time-boxed, capped, reversible, opt-in, brand-approved, and reviewed weekly. No exclusivity or revenue share exists without a signed contract.

## API Connection Blueprint

### Campaign Gateway

`vivoamigo.com` server routes create a campaign with `campaignId`, partner, consent scope, template version, audience policy, and expiration. The gateway emits only minimized campaign events to partner adapters.

### Payment Adapter

`payvivoamigo.com` creates idempotent payment or escrow intents. Provider callbacks require signature verification, replay protection, status reconciliation, and explicit reversal handling.

### Logistics Adapter

`cargovivo.com` receives shipment and assistance events. Coordinates, distance, identity, and issue type are validated server-side; partner messaging receives aggregate outcomes, not raw telemetry.

### Bank Credit Adapter

Credit requests include a consented user reference, listing ID, verified value, currency, and evidence references. The partner returns `PENDING`, `APPROVED`, `DECLINED`, or `MANUAL_REVIEW`. An unavailable adapter fails closed to manual review.

## Approved Message Drafts

These are draft templates for partner and legal review. They are not active campaigns.

**GSM SMS:**

> Comercio con controles verificables en vivoamigo.com. Explora vehículos y servicios con VIVO-CHECK, VIVO-VERIFY y opciones de pago autorizadas. Consulta condiciones: {{short_link}}. {{brand_opt_out}}

**GSM Push:**

> Llevamos Vidas, Transportamos Confianza. Revisa oportunidades verificadas en vivoamigo.com y conoce las opciones de pago disponibles.

**Bank placement:**

> ¿Encontraste tu próximo vehículo o inmueble? Solicita información de crédito desde payvivoamigo.com. La aprobación, tasa y condiciones dependen del banco participante.

**Logistics placement:**

> Compra con más confianza y coordina tu entrega con cargovivo.com. Disponibilidad, precio y cobertura dependen de la zona y del proveedor.

## Data-to-Sponsorship Analysis

The sponsor case should be measured from consented aggregate data:

1. Attribute each placement with campaign, partner, channel, landing domain, and consent version.
2. Measure delivery, click-through, verified listing view, qualified application, payment authorization, completed delivery, dispute, opt-out, and cost-equivalent media value.
3. Compare partner-supplied inventory value with incremental qualified outcomes, not raw impressions.
4. Publish a weekly partner report with confidence intervals and minimum sample sizes.
5. Renew or expand only when conversion quality, complaint rate, privacy controls, and operational capacity meet the signed pilot thresholds.

The objective is to make partner inventory economically justifiable and potentially sponsor the next pilot phase. It is not defensible to claim that data will make advertising “100% sponsored” before contracts and measured inventory value exist.

## Devin Execution Rules

- Use the official domain boundary for every adapter.
- Never fabricate provider approval, live coverage, zero-rating, bank credit, or sponsor funding.
- Keep sensitive data in isolated services and use consent-gated aggregates for partner reporting.
- Run `npm test` and `npm run security:audit` before changing campaign or financial adapters.
- Route legal, regulated, pricing, exclusivity, and data-sharing decisions to human approval.