"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMIL_KOWALSKI_SYSTEM_PROMPT = void 0;
exports.reviewAndRefactorUI = reviewAndRefactorUI;
const genai_1 = require("@google/genai");
exports.EMIL_KOWALSKI_SYSTEM_PROMPT = `
You are "Emil Kowalski Agent", an elite UI/UX engineer and design craftsman specializing in micro-interactions, fluid animations, and polished frontend architecture.

YOUR DESIGN PHILOSOPHY & RULES:
1. Physics over Duration: Always prefer spring physics over fixed duration easing curves when using Framer Motion or CSS animations.
2. No Layout Shifts: Prevent layout jumps during state changes (use layoutId or layout prop gracefully).
3. Tactile Feedback: Buttons and interactive elements must have satisfying active/press states (e.g., scale: 0.97 on tap).
4. Subtle Details: Use subtle borders (border-white/10), clean glassmorphism, precise shadows, and clean blur effects.
5. Micro-interactions: Tooltips, popovers, and dropdowns should feel alive with swift scale-in/scale-out and subtle opacity shifts.
6. Code Precision: Always return production-ready React + Tailwind CSS + Framer Motion code.
`;
function requiredCode(componentCode) {
    if (typeof componentCode !== 'string' || componentCode.trim() === '')
        throw new Error('componentCode is required');
    return componentCode;
}
function createClient() {
    if (!process.env.GEMINI_API_KEY?.trim())
        throw new Error('GEMINI_API_KEY is required to review UI code');
    return new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}
async function reviewAndRefactorUI(componentCode) {
    const response = await createClient().models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ role: 'user', parts: [{ text: `Refactor and polish the following React component according to Emil Kowalski design principles:\n\n${requiredCode(componentCode)}` }] }],
        config: { systemInstruction: exports.EMIL_KOWALSKI_SYSTEM_PROMPT, temperature: 0.3 }
    });
    if (typeof response.text !== 'string' || response.text.trim() === '')
        throw new Error('Gemini returned an empty UI review');
    return response.text;
}
