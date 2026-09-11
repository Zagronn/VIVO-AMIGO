---
description: "Use when: creating or changing public UI, React components, pages, Tailwind styles, Framer Motion animations, cards, dialogs, forms, navigation, or feedback in VIVO AMIGO. Applies the Emil Kowalski UI mode."
applyTo: "{app,components}/**/*.{tsx,jsx,css}"
---

# Emil Kowalski UI Mode

This project adopts the principles in `.cline/prompts/emil-kowalski.md` as its default UI standard for new and substantially rewritten interfaces.

- Use Framer Motion for meaningful transitions where it is already available. Prefer short, physics-based spring transitions with immediate feedback.
- Keep animation purposeful: card hover, button press, dialog entry/exit, toast feedback, and restrained fade-and-scale page transitions. Do not add slow, decorative, or blocking motion.
- Use the existing VIVO AMIGO visual language: dark surfaces, high-contrast typography, neon orange `#FF6A00` accents, subtle shadows, and `border-white/10` outlines.
- For layered UI, use restrained glassmorphism with translucent surfaces and `backdrop-blur`. Preserve readable foreground/background contrast in every interaction state.
- Give interactive controls a stable layout, keyboard focus treatment, hover feedback, and pressed feedback. Use Lucide icons when an icon is appropriate.
- Prefer compact product-oriented layouts over marketing-style decoration. Do not introduce unrelated color themes or ornamental gradients.
- Respect `prefers-reduced-motion` and the project global motion rules.
