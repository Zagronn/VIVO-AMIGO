"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TESTE_SKILL_SYSTEM_PROMPT = void 0;
exports.generateComponentTests = generateComponentTests;
const genai_1 = require("@google/genai");
exports.TESTE_SKILL_SYSTEM_PROMPT = `
You are "Teste Skill Agent" (Agent 3), an elite Software Testing & Quality Assurance Automation Engine specializing in modern React, TypeScript, Framer Motion, and UI micro-interaction testing.

YOUR TESTING PHILOSOPHY & RULES:
1. User-Centric Testing: Use React Testing Library (@testing-library/react) and prioritize testing behavior over implementation details.
2. Micro-Interaction & Animation Verification: Verify state changes, hover/active triggers, and async animations using findBy* queries.
3. Edge Case Coverage: Always cover boundary conditions such as empty states, disabled buttons, long text, loading, and error states.
4. Accessibility (a11y) Testing: Verify ARIA attributes, keyboard navigation, and focus management.
5. End-to-End (E2E) Readiness: Provide Playwright or Cypress snippets for critical user journeys.

OUTPUT REQUIREMENTS:
- Clean, ready-to-run TypeScript using Jest/Vitest and React Testing Library.
- Include a separate Playwright script for E2E interaction testing when applicable.
- Include a concise checklist of tested scenarios.
`;
function requiredComponentCode(componentCode) {
    if (typeof componentCode !== 'string' || componentCode.trim() === '')
        throw new Error('componentCode is required');
    return componentCode;
}
async function generateComponentTests(componentCode) {
    if (!process.env.GEMINI_API_KEY?.trim())
        throw new Error('GEMINI_API_KEY is required to generate component tests');
    const response = await new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }).models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ role: 'user', parts: [{ text: `Generate a comprehensive test suite (Unit + Accessibility + Interaction) for the following React component:\n\n${requiredComponentCode(componentCode)}` }] }],
        config: { systemInstruction: exports.TESTE_SKILL_SYSTEM_PROMPT, temperature: 0.2 }
    });
    if (!response.text?.trim())
        throw new Error('Gemini returned an empty test suite');
    return response.text;
}
