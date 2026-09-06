# Devin Invisible Filter Rules

These rules apply to every Devin-generated listing publication path for automotive and high-value inventory.

## Database Quarantine

- Treat every VIN, license plate, DPI, registration image, OCR result, and registry response as untrusted input.
- Never insert, update, index, cache, or publish a protected listing in the public PostgreSQL listing tables before digital verification returns `isVerified: true` and `vivoVerifySealEligible: true`.
- Keep unverified records in quarantine storage only, with access controlled by role and audit logging enabled.
- Do not copy raw DPI, document images, or registry payloads into public listing records, search indexes, analytics, logs, or model prompts.
- A timeout, adapter error, missing OCR field, SAT/PNC mismatch, stolen alert, legal lien, or owner mismatch is a failed gate. Do not retry by weakening the rule.

## Invisible Verification

- OCR must extract VIN, license plate, and owner DPI from the registration document.
- The server must query SAT and PNC adapters silently; clients receive only a polite document-review message on failure.
- `CLEAN` registry status, exact normalized OCR matches, and exact owner DPI match are all required for verification.
- Internal fraud scores, registry reasons, provider errors, and adapter availability must never be exposed to the listing owner.

## VIVO-VERIFY Dispatch

- Only a successful digital verification may trigger mobile inspector dispatch.
- VIP inspection booking must include a future appointment, listing identifier, VIN, and plate.
- Inspection dispatch is not a public seal or escrow release; those remain gated by the inspection result and existing approval rules.

## Devin Change Gate

Before changing this flow, Devin must add or update tests for the quarantine, mismatch, provider failure, and successful dispatch paths, then run `npm test` and `npm run security:audit`. External SAT/PNC credentials and production publication are never simulated.