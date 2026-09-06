# Devin Domain API Rules

These rules govern generated API integrations for the vivoamigo ecosystem.

## Official Domains

- `vivoamigo.com`: marketplace, identity, vehicle verification, and public listing APIs.
- `payvivoamigo.com`: tokenized payment, VIVO-CHECK escrow, wallet, commission, and settlement APIs.
- `cargovivo.com`: shipment, fleet, VIVO-ASSIST, GPS, and proof-of-delivery APIs.

## Integration Rules

- Use the official domain boundary for each capability; do not introduce retired regional product prefixes.
- Keep payment and vault operations on `payvivoamigo.com`; never send raw PAN, biometric templates, or unmasked DPI through marketplace or logistics endpoints.
- Keep vehicle OCR, SAT/PNC adapter calls, and VIVO-VERIFY inspection workflows on `vivoamigo.com` server routes.
- Keep logistics and roadside dispatch on `cargovivo.com`; validate identity, coordinates, distance, and issue type server-side.
- Use allowlisted HTTPS origins, parameterized queries, idempotency keys, and append-only audit events for cross-domain calls.
- Treat provider timeouts and missing credentials as unavailable integrations. Do not simulate government, payment, Cloudflare, or production success.
- Public clients receive safe status messages; provider errors, internal fraud scores, credentials, and sensitive payloads remain server-side.

## Release Gate

Before changing an official-domain API, run `npm test` and `npm run security:audit`. Record unavailable external credentials or toolchains explicitly.