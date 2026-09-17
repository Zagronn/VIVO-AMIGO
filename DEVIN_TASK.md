# DEVIN TASK: VIVO AMIGO Guatemala Commerce OS

You are implementing the VIVO AMIGO full-stack commerce operating system for Guatemala. Work autonomously inside this repository, but never claim external deployment, payment, government, cloud, or mobile release success without the required credentials and toolchains.

## Product scope

Build and maintain:

- **VIVO AMIGO:** Guatemala marketplace and corporate commerce core.
- **VIVOAMIGOPAY:** tokenized payments, bid holds, Smart Escrow, settlement, refunds, and disputes.
- **CARGO VIVO:** carrier delivery, GPS/fleet telematics, driver safety, VIVO-ASSIST roadside help, and delivery evidence.
- **VERI-SHIELD:** RENAP/DPI, NIT, corporate verification, blacklist risk, document review, and audit controls.
- **VIVO-VERIFY:** motorized field inspection, diagnostic checks, tamper-proof QR sealing, and admin review.

## Technical architecture

- Web/PWA: Next.js App Router components with TypeScript, Tailwind-compatible classes, Inter/Amazon-compatible sans typography, offline-first service worker, and official VA logo assets.
- Runtime services: Node.js TypeScript and ASP.NET Core 9 project boundaries.
- Data: PostgreSQL with JSONB/pgvector, Redis for OTP/cache, Elasticsearch semantic/search target, AWS DynamoDB serverless listing repository, Cloudflare D1/KV/R2/Vectorize edge bindings.
- Production target: AWS `us-east-1`, Cloudflare Enterprise edge/WAF, domains `vivoamigo.com`, `payvivoamigo.com`, and `cargovivo.com`.

## Mandatory trust gates

1. Corporate sellers require Registro Mercantil and NIT/tax documents, AI review where available, and admin approval before publication.
2. Real estate requires Libertad de Gravamen, notarized title, location proof, OCR consistency checks, and admin approval.
3. Vehicles and high-value equipment require inspection evidence before “verified” status.
4. VIVO-CHECK generates a short-lived `VIVO-####-GT` code and a 1% temporary hold; seller on-site verification moves the session to `VERIFIED_ON_SITE`.
5. Smart Escrow requires KYC or government escrow approval, fully signed contracts, held funds, and delivery/notary evidence before release.
6. Do not issue completion/delivery codes or release funds from a click, quote, or unverified status.

## VIVO-CHECK and VIVOAMIGOPAY

- Use tokenized card references only; never accept or persist raw PAN/card numbers in browser or application logs.
- Visanet/NeoNet adapters own 3DS and authorization; the application consumes their verified result.
- Persist exact commission basis points, currency, idempotency keys, status, and audit timestamps.
- Support bid collateral, fraud penalty, refunds, disputes, and settlement reconciliation.

## CARGO VIVO and VIVO-ASSIST

- Track `PENDING_PICKUP`, `IN_TRANSIT`, `DELIVERED`, and `DISPUTED` states.
- Support Cargo Expreso, GuateEx, and CARGO VIVO carriers.
- Hold delivery escrow for 24 hours after confirmed delivery before payout approval.
- Monitor speed and deduct safety points for overspeeding; expose driver score, plate, DPI verification, QR status, GPS tracking, and safe delivery count.
- VIVO-ASSIST fixed pricing: tow truck Q250 + Q12/km; flat tire Q100 + Q5/km; battery Q80 + Q5/km; fuel Q75 + Q5/km.
- Validate coordinates, distance, issue type, and user identity server-side.

## Marketplace and monetization

- Individual listing policy: first two eligible vehicle/real-estate listings free, later fees plan-controlled.
- Professional and Gold sellers: subscriptions plus configured success/transaction fees.
- Services: fixed bid fee or configured success fee.
- Escrow: disclose buyer/platform fee before checkout.
- BYD and partner leads: preserve campaign attribution, consent, qualification, conversion, and payout state.
- Use consent-gated predictive campaigns only. Mask phone/email and do not segment users without explicit privacy and data monetization consent.

## Data and security

- KYC types include `BASIC_PHONE`, `KYC_VERIFIED`, and `GOVERNMENT_ESCROW_APPROVED`.
- Blacklist AI scores VPN and rapid actions, with explainable thresholds and reviewable outcomes.
- Store inspection reports with QR/PDF URLs, score, inspector, and seal status.
- Make admin decisions append-only/auditable and protect sensitive DPI, bank, device, and location data by role.
- Never describe a platform status as a legal/government guarantee without the qualified provider’s actual approval.

## Delivery workflow

1. Start at the nearest concrete route, service, schema, test, or failing behavior.
2. Read local instructions and preserve existing APIs/patterns.
3. Make the smallest coherent edit.
4. Run the narrowest executable check immediately.
5. Run `npm test`, `npm run check:mobile`, and relevant native/edge checks.
6. Attempt `npm run type-check` and `npm run build`; if scripts/toolchains are absent, report that honestly and do not simulate success.
7. Verify `/api/v1/health` and local showcase health when the service is running.
8. Commit only after tests pass. Never expose secrets or commit generated credentials.

## Success criteria

A task is complete only when behavior is implemented, tests cover the contract, error/edge states are handled, the worktree is clean or unrelated changes are clearly preserved, and unavailable external operations are explicitly recorded. Prefer measurable trust, auditability, consent, and reversible rollout over claims of zero fraud or guaranteed financial/legal outcomes.
