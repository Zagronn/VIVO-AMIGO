# Guatemala Revenue Engine

This document is the implementation brief for the VIVO AMIGO AI agent. It describes monetization rules, settlement boundaries, and the minimum event data needed to audit every platform charge.

## Revenue lanes

| Lane | Trigger | Default platform fee |
| --- | --- | --- |
| Individual listings | First two vehicle/real-estate listings are free; later listings create a `listing_fee` charge | Plan-defined |
| Professional sellers | Active subscription plus completed sale | 50-100 bps success fee |
| Services | A provider quotes on a lead or wins the job | Fixed `bid_fee` or 500-1000 bps success fee |
| B2B wholesale | Gold subscription plus completed wholesale settlement | Plan-defined transaction fee |
| Escrow | Buyer funds are held until delivery acceptance | 200-500 bps buyer service fee |
| Direct brand leads | Qualified BYD/test-drive lead attribution | USD 10-50 partner payout |

Rates are stored in basis points (`100 bps = 1%`) and must be configured per plan or campaign. Never calculate money from display text.

## Core flows

1. **Listing gate**: resolve the seller plan, count the seller's published listings, waive the first two eligible individual listings, otherwise create a pending `listing_charges` row before publication.
2. **Lead marketplace**: create `marketplace_leads`, accept provider quotes in `lead_quotes`, and charge either the submitted bid fee or the configured success fee when the lead reaches `won`.
3. **Escrow**: create a `marketplace_transactions` row, hold funds in VIVOAMIGOPAY, create `escrow_orders`, and release only after CARGO VIVO delivery confirmation or buyer acceptance. Refunds and disputes are separate terminal states.
4. **Settlement**: calculate `platform_fee = gross_amount * commission_bps / 10000`, persist the exact rate used, and emit an auditable ledger event before seller payout.
5. **Brand attribution**: BYD/test-drive form submissions create a `marketplace_leads` row and an `ad_leads` row with campaign, source, qualification, conversion, and partner payout status.

## Agent guardrails

- Do not release escrow on a click, quote, or shipment creation event; require delivery/acceptance evidence.
- Do not charge both a bid fee and success fee for the same lead unless the active plan explicitly says so.
- Keep buyer, seller, and provider identities separate from campaign attribution.
- Use idempotency keys for charge creation and settlement retries.
- Store currency and fee basis points on each financial record so later plan changes cannot rewrite historical economics.
- Surface fees before checkout/quote submission and preserve consent/audit metadata.

## SEO and acquisition priorities

Drive the high-intent pages from `config/seoKeywords.ts`: rentals in Zona 10, affordable used vehicles, economical freight, and professional construction services. Each lead must preserve its landing slug and campaign attribution through conversion.
