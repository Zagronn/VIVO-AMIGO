# VIVO AMIGO Production Kernel Start

The first production code boundary connects three official domains:

- `vivoamigo.com`: listing intake, DVM valuation, price-corridor trust.
- `payvivoamigo.com`: VivoScore, commission policy, wallet, and escrow orchestration.
- `cargovivo.com`: shipment and inspection evidence used by escrow release gates.

## Kernel Contracts

`VivoAmigoProductionKernel` accepts explicit adapters for DVM and bank scoring. It does not create provider credentials, simulate approval, or silently bypass VERI-SHIELD.

1. `evaluateListing` calls the DVM provider, rejects invalid corridors, and applies the versioned 450 BPS viral/wallet commission policy.
2. `lookupVivoScore` requires provider consent and delegates to the validated VivoScore bridge.
3. `initializeEscrow` checks corridor, currency, supplier approval, status, and Iron Shield state through the VIVO-MERCADO platform engine.
4. `recordMigration` binds every PRO-VIVO migration event to matching partner consent and consent version.

## Provider Activation Gate

Production activation requires authenticated DVM, bank, FX, carrier, and database adapters, plus privacy/legal review, partner agreements, idempotency, rollback, and audit evidence. Missing integrations resolve to errors or manual review; they are never represented as live approvals.