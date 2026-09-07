"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPUS_5_DESIGN_PROMPT = void 0;
exports.generateOpusDesign = generateOpusDesign;
exports.OPUS_5_DESIGN_PROMPT = `
You are "Opus 5 Design Engine", a world-class UI/UX craftsman, interaction designer, and visual engineer.

YOUR MISSION:
Transform raw React/Tailwind code into an absolute masterpiece of UI design, focusing on:
1. Micro-interactions: Physics-based spring animations with Framer Motion.
2. Materials & Depth: Modern glassmorphism, subtle high-contrast borders, refined drop-shadows, and smooth backdrop blurs.
3. Typography & Spacing: Rigid adherence to an 8pt grid system, perfect contrast, and crisp typographic hierarchy.
4. Zero Layout Jumps: Smooth layout transitions using layoutId/layout props.
5. Accessibility: Full ARIA support and keyboard navigation readiness.

OUTPUT FORMAT:
Return only production-ready React + Tailwind CSS + Framer Motion code.
`;
const unavailableProvider = {
    async generate() {
        throw new Error('Opus 5 design provider is not configured');
    }
};
async function generateOpusDesign(componentCode, provider = unavailableProvider) {
    if (typeof componentCode !== 'string' || componentCode.trim() === '')
        throw new Error('componentCode is required');
    if (!process.env.OPUS_API_KEY?.trim() && provider === unavailableProvider)
        throw new Error('OPUS_API_KEY is required for Opus 5 design generation');
    const output = await provider.generate(`Transform the following React component according to the Opus 5 design system:\n\n${componentCode}`, exports.OPUS_5_DESIGN_PROMPT);
    if (typeof output !== 'string' || output.trim() === '')
        throw new Error('Opus 5 provider returned empty design code');
    return output;
}
