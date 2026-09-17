# Corporate Trust Chain

This is the implementation brief for the VIVO AMIGO approval pipeline. It is a product control system, not a claim that the platform can guarantee zero fraud or replace Guatemalan legal, notarial, tax, registry, or financial authorities.

## Seller gate

- A seller cannot publish real-estate, vehicle, or other corporate inventory until `corporate_verifications.verification_level = 'admin_approved'`.
- Required inputs are legal name, NIT, Registro Mercantil number, mercantile registration document, and tax certificate.
- AI OCR and government adapters may set `ai_review` or `government_verified`; neither is sufficient for publication without human admin approval.
- Verification expiry and rejection reasons are persisted and auditable.

## Property gate

Real-estate listings require all applicable `property_documents` records:

- `LIBERTAD_GRAVAMEN`
- `NOTARIZED_TITLE`
- `LOCATION_PROOF`

Document OCR extracts seal/date/zone/area. A mismatch between extracted property data and listing data sends the listing to `manual_review` or `rejected`. Publication requires approved documents and an `admin_approvals` decision of `approved`.

## Transaction and escrow gate

1. Create the transaction in `initiated` state.
2. Require `signed_contracts.status = 'fully_signed'`.
3. Hold buyer funds in `escrow_orders.status = 'funds_held'`.
4. Do not issue `delivery_code` until contract, funds, and required admin approvals are complete.
5. Record delivery/notary evidence and an admin approval.
6. Release escrow, calculate the stored commission basis points, and settle seller payout.

Every transition must be idempotent and auditable. Disputes, refunds, rejected documents, and expired corporate verification are terminal or explicitly reviewed states.

## Devin implementation order

1. Build provider interfaces for Registro Mercantil, SAT/NIT, document OCR, and admin decisions.
2. Implement the seller publication policy as a server-side authorization check; UI locks are advisory only.
3. Implement property-document consistency checks and review queues.
4. Implement signed-contract and escrow state transitions with idempotency keys.
5. Add an admin dashboard with least-privilege roles, immutable decision records, and evidence links.
6. Add integration tests for unpaid/unverified sellers, OCR mismatch, unsigned contracts, unfunded escrow, approved delivery, refund, and dispute flows.
