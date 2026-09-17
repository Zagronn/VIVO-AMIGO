# Devin Finance Model and Security Rules

## Projection model

- Horizon: 24 months.
- Target GMV: USD 200,000,000.
- Average commission/service rate: 3.5%.
- Additional target revenue: USD 5,000,000.
- Net revenue model: GMV x commission rate + additional revenue.
- Exit valuation scenario: 8x to 10x net revenue.
- Projection output is scenario analysis, not a promise or investment advice.

## Dashboard rules

The executive dashboard may show GMV, net revenue, active users, fleet size, and valuation range. Every metric must carry its currency, period, source, and last-updated timestamp. Do not present projections as realized revenue or guaranteed valuation.

## Zero-vulnerability audit rules

Before any financial or security-related deployment:

1. Run `npm test` and `npm run security:audit`.
2. Block if raw PAN/card data, secrets, credentials, or unmasked DPI/PII appear in browser/mobile source.
3. Require token-only Visanet/NeoNet integration and server-side 3DS result handling.
4. Check SQL parameters, JSON-LD escaping, XSS output encoding, and authorization at the server boundary.
5. Require idempotency for commission, escrow, reward, and payout operations.
6. Keep strategic pricing, commission, valuation, lending, and geographic decisions human-approved.
7. Record exact assumptions, basis points, currency, and versioned policy used for every financial output.
8. Do not claim PCI, WAF, cloud, bank, government, or production security compliance without external evidence and credentials.

A failed audit blocks release. A missing toolchain is a blocked verification, not a passing result.
