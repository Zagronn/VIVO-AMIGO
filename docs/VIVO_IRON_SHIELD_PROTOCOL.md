# VIVO AMIGO Iron Shield Protocol

## Purpose

Iron Shield is the zero-trust security policy for VIVO-CHECK, VIVO-VERIFY, VIVOAMIGOPAY, and executive security operations. Every request is treated as untrusted until the relevant identity, device, transaction, location, and authorization checks pass.

## Zero-Trust Rules

- Deny by default. Authentication, authorization, request validation, and audit evidence are required at every sensitive boundary.
- Never release escrow, issue delivery codes, or verify OTP flows from an unverified click or client-only state.
- Accept tokenized card references only. Raw PAN values must never enter browser state, logs, primary databases, or application APIs.
- Rate-limit requests and block SQL injection and burst-traffic indicators at the edge or service boundary.
- Freeze the account and emit a management alert when a transaction exceeds the configured user baseline risk threshold.

## Vault Isolation

- Financial tokens and RENAP/biometric material are stored outside primary marketplace records in an isolated vault.
- Vault records are encrypted with authenticated encryption and referenced by opaque vault identifiers.
- Primary databases may store status, provider references, hashes, and audit metadata, but not raw card data, biometric templates, or unmasked DPI values.
- Production requires `VIVO_VAULT_KEY` with at least 32 bytes. Local fallback keys are for development and must not be used in production.

## Biometric and Identity Requirements

- Account creation requires a successful RENAP response, liveness detection, and a linked identity key.
- The same identity key cannot belong to multiple accounts.
- Biometric material is hashed before vault storage and is never returned by application APIs.
- Provider failures are fail-closed; an unavailable RENAP or liveness adapter cannot produce a verified identity.

## VIVO-CHECK OTP

- OTPs are exactly four digits, stored only as hashes, and expire after 120 seconds.
- Buyer and seller coordinates must be valid and within the configured geofence at issuance and verification.
- A GPS mismatch, expired challenge, replay, or emergency lock rejects the verification.

## Executive Emergency Lock

The management panel can activate an emergency lock through `POST /v1/security/emergency-lock`. Activation:

1. Sets the threat level to `CRITICAL_ATTACK`.
2. Isolates the vault status.
3. Pauses escrow transfers and OTP issuance/verification.
4. Records an append-only management alert.

The current state is available from `GET /v1/security/status`. Unlocking is intentionally absent from the public API and requires a separate reviewed operational procedure.

## Deployment Gate

Before deployment, `npm run security:audit` runs application tests, browser secret/card exposure checks, syntax checks, and the Iron Shield pentest. SQLi or DDoS indicators invoke sandbox-isolation and hot-fix callback hooks; production remediation must be reviewed and deployed through the normal controlled pipeline.