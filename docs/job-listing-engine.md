# Guatemala Job Listing Engine

Job listings follow a 15-day freshness cycle and use the corporate trust chain. This is a technical marketplace policy; employment, tax, escrow, and labor compliance still require the appropriate Guatemalan legal and regulated providers.

## Publication gate

A company job listing requires:

- `corporate_verifications.verification_level = 'admin_approved'`
- A signed `hiring_commitments` record promising to report a hire through the platform
- `published_at` and `expires_at = published_at + 15 days`

Unverified companies cannot publish. Client-side locks are advisory; the server must enforce the gate.

## Lifecycle

- A scheduled worker marks active listings as `EXPIRED` when `expires_at <= now()` and archives them from public search.
- The employer may request one or more renewals through `job_listing_renewals`; every renewal extends exactly 15 days and records any fee/status.
- Early closure with reason `FILLED` records an incentive eligibility event for a future promotion/doping credit. Credits must be capped, auditable, and never alter historical fees.

## Service escrow

For `SERVICE_CONTRACT` and `SUBCONTRACTOR` work:

1. Match an approved candidate and persist `job_matches`.
2. Create a marketplace transaction and hold funds in VIVOAMIGOPAY.
3. Create `job_escrow_closures` with `funds_held`.
4. Employer confirms work completion and uploads evidence.
5. Admin/provider checks complete the release decision.
6. Release provider payout, persist platform fee, and close the listing as `FILLED`.

Do not issue delivery or completion codes before funds are held and the required contract/approval state is complete.

## AI matching

Smart Match may rank approved candidates using skills, zone, availability, and intent. It must not bypass corporate verification, fabricate candidate qualifications, or make protected-attribute decisions. Every suggestion should remain explainable and auditable.
