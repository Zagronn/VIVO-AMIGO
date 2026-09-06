# Security and Finance Gates

## Zero-knowledge financial boundary

VIVO AMIGO does not store raw PAN/card numbers, CVV, bank secrets, or unmasked payment credentials. Browser and application code accept provider tokens only. Visanet/NeoNet own 3DSecure authorization and tokenization; the application receives an opaque token and provider result. “Zero-knowledge” here means the application minimizes knowledge of payment secrets, not that external providers or regulated parties are bypassed.

## Deployment security gates

Every deploy must run:

- `npm test`
- JavaScript syntax checks
- Secret/raw-card pattern scan over browser/mobile sources
- SQLi/XSS contract checks: parameterized queries, URL encoding, escaped JSON-LD
- Provider and credential checks in the deployment environment

A failed scan blocks deployment. The repository script is `scripts/security-audit.sh`; it is intentionally conservative and must be supplemented with authenticated DAST/SAST tooling in CI.

## Reporting model

- `gmv_reporting_daily` stores daily USD GMV, transaction count, and platform revenue snapshots.
- `escrow_reporting_snapshots` stores held/released GTQ amounts and active transaction counts.
- `vivo_assist_subscription_metrics` stores active subscription counts, completed requests, and gross service revenue.

Reporting jobs must aggregate from auditable transaction/escrow/subscription records, use idempotent upserts, and never expose individual buyer/seller data in dashboards.
