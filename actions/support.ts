'use server';

import type { ActionResult } from '@/actions/reviews';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SYSTEM_PROMPT = `You are the VIVO SUPPORT assistant for VIVO AMIGO, a Latin American
marketplace and classifieds platform (marketplace products, real estate, vehicles, jobs, and
second-hand goods). Help customers, sellers, and visitors with questions about orders, payments
(VIVO PAY), shipping (VIVO SHIP), becoming a seller (VIVO BUSINESS), and using the site. Be warm,
concise, and practical. If you don't know something site-specific, say so plainly and suggest the
person use the /contact page instead of inventing an answer. Keep replies short — a few sentences,
not an essay.`;

/**
 * Calls the Anthropic Messages API directly over fetch (no SDK dependency,
 * since this sandbox can't install packages). Requires ANTHROPIC_API_KEY to
 * be set — falls back to a clear, non-crashing message otherwise so the page
 * still renders fine before that's configured.
 */
export async function askSupportAssistant(history: ChatMessage[]): Promise<ActionResult<{ reply: string }>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: 'Support chat isn’t configured yet — add an ANTHROPIC_API_KEY to your .env to enable it.',
    };
  }

  const trimmedHistory = history.slice(-12).filter((m) => m.content.trim().length > 0);
  if (trimmedHistory.length === 0) {
    return { success: false, error: 'Type a message first.' };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: trimmedHistory.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('Support assistant API error:', response.status, errorBody);
      return { success: false, error: 'The support assistant is temporarily unavailable. Please try again shortly.' };
    }

    const data = (await response.json()) as { content?: { type: string; text?: string }[] };
    const reply = data.content?.find((block) => block.type === 'text')?.text?.trim();

    if (!reply) {
      return { success: false, error: 'The support assistant didn’t return a response. Please try again.' };
    }

    return { success: true, data: { reply } };
  } catch (error) {
    console.error('Support assistant request failed:', error);
    return { success: false, error: 'Could not reach the support assistant. Please try again shortly.' };
  }
}
