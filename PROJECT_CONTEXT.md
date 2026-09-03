# VIVO AMIGO SOVEREIGN OS - PROJECT CONTEXT & ARCHITECTURE BRIEF

## System Overview
- Ecosystem: VIVO AMIGO Super-App Ecosystem ($100B Sovereign Vision)
- Modules: PAY VIVO (Escrow & Payments), CARGO VIVO (Logistics), VIVO POS (Micro-vendor POS)
- Compliance: VERI-SHIELD (RENAP/SAT Integration)
- Core Infrastructure: Apple Silicon macOS, Node.js v26.8.1, PostgreSQL/SQLite local vault

## Core Execution Deliverables
1. `schema.sql`: Core PostgreSQL relational schema covering users, escrow wallets (PAY VIVO), shipments (CARGO VIVO), and terminals/sales (VIVO POS).
2. `compliance.api.js`: Node.js/Express API handling RENAP identification and SAT tax verification via VERI-SHIELD.
3. `vivopos.service.js`: Node.js/Express service providing dynamic QR code generation, offline transaction syncing, and SAT micro-FEL invoice issuance for street vendors.
4. `handoff.md`: Cross-device state persistence log documenting completed tasks, active agents, and test results.

## Swarm Architecture
Master Agent swarm (35+ agents) orchestrated via NVIDIA Nemotron 3.5 / Llama 3.1.
