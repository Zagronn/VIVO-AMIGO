"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callOpusDesignEngine = callOpusDesignEngine;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const OPUS_DESIGN_SYSTEM_PROMPT = 'Return only production-ready React + Tailwind CSS + Framer Motion code. Apply spring physics, glassmorphism, no layout jumps, accessibility, and an 8pt spacing grid.';
async function callOpusDesignEngine(componentCode) {
    if (!componentCode.trim())
        throw new Error('componentCode is required');
    if (!process.env.ANTHROPIC_API_KEY?.trim())
        throw new Error('ANTHROPIC_API_KEY is required for Opus pipeline');
    const response = await new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY }).messages.create({
        model: process.env.ANTHROPIC_OPUS_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.2,
        system: OPUS_DESIGN_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Refactor this React component:\n\n${componentCode}` }]
    });
    const block = response.content.find((item) => item.type === 'text');
    if (!block || block.type !== 'text' || !block.text.trim())
        throw new Error('Opus provider returned no design output');
    return block.text;
}
