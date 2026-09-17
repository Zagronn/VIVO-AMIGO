# VERI-SHIELD Bank API Whitepaper

## Objective

Provide banks with a controlled trust interface for VIVO-MERCADO and PayVivo integrations. VERI-SHIELD supplies evidence references and policy decisions; the bank retains KYC, underwriting, pricing, approval, servicing, and regulated reporting authority.

## API Boundary

- `vivoamigo.com`: listing, identity, DVM, VIVO-VERIFY, and consent capture.
- `payvivoamigo.com`: tokenized wallet, escrow intent, settlement, commission policy, and idempotency ledger.
- Bank adapter: server-to-server only; provider credentials never reach browser/mobile code.

### Request envelope

`requestId`, `userReference`, `listingId`, `consentReference`, `verificationEvidenceHash`, `assetValue`, `currency`, `requestedAmount`, `policyVersion`, and `createdAt`.

### Response states

`PENDING`, `APPROVED`, `DECLINED`, and `MANUAL_REVIEW`. A provider timeout or invalid signature resolves to `MANUAL_REVIEW`, never approval.

## Zero-Trust Controls

- mTLS or signed OAuth service authentication.
- Webhook signature validation, timestamp tolerance, replay prevention, and idempotency keys.
- No raw PAN, biometric template, unmasked DPI, or bank payload in logs or public listing data.
- Least-privilege partner tenant access and append-only audit events.
- Encryption in transit and at rest with managed key rotation.
- Emergency lock pauses credit/escrow side effects.
- Human approval for pricing, eligibility exceptions, data-sharing, and production release.

## Evidence Package

Every decision retains the policy version, consent version, evidence hash, provider reference, decision state, operator or adapter identity, timestamp, and appeal path. This is a technical control proposal, not a claim of bank, government, PCI, or regulatory certification.