# B2B Supplier Verification

## Scope

This specification governs China/Türkiye to Guatemala import-export suppliers using `vivoamigo.com`, `payvivoamigo.com`, and `cargovivo.com`. It is an implementation and partner-review standard, not a government approval or customs clearance.

## Onboarding Gates

1. Capture legal entity name, source country, registration evidence, beneficial-owner review, contact, and settlement account reference.
2. Validate supplier identity and sanctions/compliance requirements through the approved provider adapter.
3. Validate product documents, commercial invoice, declared value, HS classification, and shipping evidence.
4. Run VERI-SHIELD review: identity, document consistency, price corridor, fraud indicators, and manual exceptions.
5. Approve a supplier tenant with least-privilege access and an auditable decision record.

## Escrow and Currency

- Supported first corridor: `TR|CN -> GT`.
- Settlement currencies: `USD`, `GTQ`, `TRY`, and `CNY`; FX conversion requires an approved rate provider and a recorded rate/timestamp.
- `payvivoamigo.com` creates an idempotent escrow intent only after supplier approval and `PENDING_ESCROW` state validation.
- Funds remain locked until VERI-SHIELD cargo inspection, delivery evidence, dispute checks, and all contractual release conditions pass.
- `cargovivo.com` owns tracking and proof-of-delivery events; a tracking event alone cannot release funds.
- Emergency lock, mismatch, provider timeout, sanctions hit, or dispute routes the deal to manual review.

## Data and Audit

- Store tokenized supplier and buyer references, not raw card or unnecessary identity payloads.
- Record deal ID, currency, amount, idempotency key, provider references, evidence hashes, status transitions, and timestamps.
- Separate supplier tenants and never expose one partner's customer list to another.
- Retain only the minimum data required for legal, financial, customs, dispute, and audit obligations.
- Export regulator or partner reports as minimized, role-authorized evidence packages.

## Release Evidence

Before a supplier moves to active trading, retain: verification decision, reviewer identity, source documents, screening result, corridor/currency approval, escrow test, CARGO integration test, rollback plan, and incident contact. Missing adapters or credentials are reported as unavailable, never simulated as approved.