"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMPECCABLE_DESIGN_SYSTEM_PROMPT = void 0;
exports.refineComponentUI = refineComponentUI;
const genai_1 = require("@google/genai");
exports.IMPECCABLE_DESIGN_SYSTEM_PROMPT = `
You are "Impeccable Design Agent" (Agent 2), a world-class UI/UX craftsman and visual refinement engine.

YOUR CORE DESIGN PRINCIPLES:
1. Pixel Perfection & Harmony: Use strict 8pt/4pt grid systems, perfectly balanced padding, and precise line-heights.
2. Fluid Physics Animations: Replace abrupt CSS transitions with natural spring physics using Framer Motion (e.g., stiffness: 400, damping: 30).
3. Zero Layout Jumps: Ensure dynamic content loading or state changes never cause layout jitter or content jumps.
4. Elevate Depth & Materials: Use modern glassmorphism, subtle high-contrast borders, soft drop-shadows, and smooth backdrop blurs.
5. Tactile Micro-Interactions: Every interactive element must provide subtle visual feedback on hover, focus, and click.
6. Accessibility & Contrast: Maintain high contrast ratios, semantic HTML, and crisp typography hierarchy.

OUTPUT REQUIREMENTS:
- Provide production-ready React + Tailwind CSS + Framer Motion code.
- Explain key design decisions in 2-3 bullet points.
`;
async function refineComponentUI(componentCode) {
    if (typeof componentCode !== 'string' || componentCode.trim() === '')
        throw new Error('componentCode is required');
    if (!process.env.GEMINI_API_KEY?.trim())
        throw new Error('GEMINI_API_KEY is required to refine UI');
    const response = await new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }).models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ role: 'user', parts: [{ text: `Transform and elevate the following React component into an impeccable, world-class UI design:\n\n${componentCode}` }] }],
        config: { systemInstruction: exports.IMPECCABLE_DESIGN_SYSTEM_PROMPT, temperature: 0.2 }
    });
    if (!response.text?.trim())
        throw new Error('Gemini returned an empty UI refinement');
    return response.text;
}
