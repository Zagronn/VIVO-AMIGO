# Institutional Pitch: Banco Industrial & Zigi

**Counterparty:** Banco Industrial / Zigi  
**Platform boundary:** `vivoamigo.com` marketplace and `payvivoamigo.com` payments  
**Status:** Proposal for partner review; no banking, lending, or payment integration is active by this document.

## Strategic Offer

VIVO AMIGO can place a bank-approved credit journey next to eligible vehicle and property listings. VIVO-VERIFY and VERI-SHIELD provide evidence and workflow signals; Banco Industrial retains KYC, underwriting, approval, disclosure, servicing, and regulated decision authority.

## API Specification

### Prequalification

- Endpoint owner: Banco Industrial adapter, server-to-server only.
- Input: consented user reference, listing ID, currency, price, verification evidence reference, and requested term.
- Output: provider reference, decision state (`PENDING`, `APPROVED`, `DECLINED`, `MANUAL_REVIEW`), expiry, and next action.
- Never send raw PAN, biometric templates, or unnecessary DPI data to the marketplace.

### Escrow and Settlement

- `payvivoamigo.com` creates an idempotent escrow intent with amount, currency, buyer/seller references, and contract state.
- Banco adapter confirms authorization and settlement by provider reference; application status remains pending until the provider callback is authenticated.
- Release requires existing signed-contract, delivery, dispute, and audit gates.

### Webhooks and Controls

- Require signed webhook payloads, replay protection, idempotency keys, timestamp tolerance, and an append-only audit event.
- Timeout or provider unavailability fails closed to `PENDING_PROVIDER_REVIEW`.
- No UI state can approve credit, release escrow, or represent a bank guarantee.

## Proposed Zero-Budget Barter Terms

These are negotiation options, not agreed commercial terms:

- VIVO AMIGO provides qualified, consented purchase-intent placement and verified listing context.
- Banco Industrial provides approved co-branded prequalification access, subject to compliance and underwriting review.
- Both parties may exchange launch placement, educational content, and qualified lead attribution instead of an upfront media budget during a time-boxed pilot.
- Each party pays its own regulated operations, infrastructure, support, legal, and compliance costs unless a signed agreement states otherwise.
- Any referral fee, revenue share, data processing, or exclusivity requires written approval and an auditable contract.

## Success Measures

Track consented impressions, qualified applications, provider response time, approval rate, funded volume, disputes, and conversion by campaign. Do not present projections as realized bank performance.