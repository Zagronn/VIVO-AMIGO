# VIVO-DESIGN Agent Standards

## Mission

Build VIVO AMIGO interfaces with premium product clarity, not interchangeable dashboard or landing-page patterns. Every surface should feel trustworthy, precise, responsive, and intentionally designed for Guatemala commerce.

## Visual system

- **Typography:** Inter/SF Pro Display-style sans-serif; clear hierarchy, strong contrast, readable line-height, and restrained tracking.
- **Primary mode:** Deep obsidian `#070312` with rich neon violet `#8B5CF6`, indigo `#4C1D95`, blue `#3B82F6`, and silver/official VIVO tokens where the product surface requires them.
- **Glass:** Use translucent white borders `rgba(255,255,255,0.08)`, restrained backdrop blur, and layered shadows. Glass must support hierarchy, not flatten content into decoration.
- **Lighting:** Ambient radial mesh lighting is allowed when subtle and purposeful. Avoid noisy blobs, excessive glow, and unreadable contrast.
- **Cards:** Prefer asymmetric bento grids, clear grouping, and single-level framing. Avoid nested cards and generic card walls.

## Interaction standards

- Every visible CTA must do something real or clearly state its integration boundary.
- Use semantic buttons, links, labels, status regions, keyboard focus, and meaningful alt text.
- Respect reduced motion and preserve stable dimensions on mobile.
- Provide loading, empty, error, selected, and completed states for interactive flows.
- Keep text inside its container and test narrow screens before shipping.
- Make trust signals visible: VIVO-CHECK, VIVOAMIGOPAY, CARGO VIVO, VERI-SHIELD, admin review, and evidence states.

## Product composition

- Main portal: brand, ecosystem signal, and a direct route into marketplace actions.
- Marketplace: dense scan-friendly filters, category hierarchy, real price/status states, and WhatsApp/escrow actions.
- Payments: balance, fee disclosure, escrow state, and settlement history.
- Logistics: route status, ETA, driver verification, GPS/telematics, and VIVO-ASSIST emergency actions.

## Engineering rules

- Reuse existing VIVO tokens/components before adding abstractions.
- Keep server-side authorization and payment/escrow controls out of client-only UI.
- Never expose raw card data, DPI, phone, or credentials.
- Run focused validation immediately after edits, then `npm test`.
- Do not claim browser screenshots, Next builds, native builds, cloud deployment, or external provider verification unless those operations actually ran.
