const OPUS_DESIGN_SYSTEM_PROMPT = `
You are "Opus 5 Design Engine", a world-class UI/UX craftsman, interaction designer, and visual engineer.

YOUR MISSION:
Transform raw React/Tailwind code into an absolute masterpiece of UI design, focusing on:
1. Micro-interactions: Physics-based spring animations with Framer Motion.
2. Materials & Depth: Modern glassmorphism, subtle high-contrast borders (border-white/10), refined drop-shadows, and smooth backdrop blurs.
3. Typography & Spacing: Strict 8pt grid system adherence, high contrast, crisp hierarchy.
4. Zero Layout Jumps: Smooth transitions using Framer Motion layout props.

OUTPUT FORMAT:
Return ONLY production-ready React + Tailwind CSS + Framer Motion code block. Do not write introductory prose.
`;

export async function callOpusDesignEngine(componentCode: string): Promise<string> {
  if (typeof componentCode !== 'string' || componentCode.trim() === '') throw new Error('componentCode is required');
  if (!process.env.ANTHROPIC_API_KEY?.trim()) throw new Error('ANTHROPIC_API_KEY is required');
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_OPUS_MODEL || 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    temperature: 0.2,
    system: OPUS_DESIGN_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Refactor and elevate the following React component to absolute perfection:\n\n${componentCode}` }]
  });
  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text' || !textBlock.text.trim()) throw new Error('Anthropic returned no text design output');
  return textBlock.text;
}

export { OPUS_DESIGN_SYSTEM_PROMPT };