# Institutional Pitch: Tigo Money & Tigo Business

**Counterparty:** Tigo Money / Tigo Business  
**Platform boundary:** `vivoamigo.com` marketplace, `payvivoamigo.com` payments, and `cargovivo.com` logistics  
**Status:** Proposal for partner review; no Tigo API, zero-rating, SMS, or payment integration is active by this document.

## Strategic Offer

Connect Tigo Money payment options and consented Tigo Business distribution to marketplace and logistics workflows. Tigo retains wallet, network, messaging, customer-support, and regulated payment controls.

## API Specification

### Tigo Money Payment Adapter

- Server-side OAuth or signed service authentication; credentials never reach browser code.
- Create payment request with idempotency key, amount, GTQ currency, order reference, callback URL, and buyer consent reference.
- Consume provider states such as `PENDING`, `AUTHORIZED`, `FAILED`, `EXPIRED`, and `REVERSED`.
- Verify callbacks, prevent replay, reconcile reversals, and never mark escrow funded from a client redirect alone.

### Distribution and Messaging

- Campaign audiences must be opt-in and consent-gated.
- SMS and push requests include campaign ID, destination reference, template version, frequency policy, and unsubscribe state.
- Preserve attribution and suppress sensitive DPI, payment, device, and precise location data.

### Connectivity and Zero-Rating

- Any sponsored-data or zero-rating arrangement requires Tigo network review, domain allowlisting, abuse controls, and a signed service schedule.
- Proposed domains: `vivoamigo.com`, `payvivoamigo.com`, and `cargovivo.com`.
- Availability, coverage, traffic treatment, and commercial terms must be measured during a controlled pilot.

## Proposed Zero-Budget Barter Terms

These are negotiation options, not an active commitment:

- VIVO AMIGO offers consented marketplace and logistics campaign placement plus qualified attribution.
- Tigo may provide pilot distribution, wallet discovery placement, or approved messaging inventory instead of an upfront media purchase.
- The pilot is time-boxed, capped, reversible, and subject to brand, privacy, network, and regulatory approval.
- Each party owns its customer support and operational costs unless a signed agreement states otherwise.
- No exclusivity, user-data transfer, zero-rating, or revenue share exists without a signed contract.

## Success Measures

Measure opt-in rate, payment authorization rate, completion rate, reversal rate, support contacts, delivery conversion, campaign attribution, and privacy complaints. Report actual observations separately from targets.