'use client';

import { useRef, useState } from 'react';
import { askSupportAssistant, type ChatMessage } from '@/actions/support';

export function SupportChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I’m the VIVO SUPPORT assistant. Ask me about orders, payments, shipping, or selling on VIVO AMIGO.' },
  ]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setError(undefined);
    setPending(true);

    const result = await askSupportAssistant(nextMessages);

    if (result.success) {
      setMessages([...nextMessages, { role: 'assistant', content: result.data.reply }]);
    } else {
      setError(result.error);
    }
    setPending(false);
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  }

  return (
    <div className="glass-card mx-auto flex h-[520px] w-full max-w-lg flex-col overflow-hidden">
      <div className="border-b border-vivo-black/5 p-4">
        <p className="font-bold text-vivo-black">VIVO SUPPORT assistant</p>
        <p className="text-xs text-vivo-black/50">Answers in seconds, day or night.</p>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-vivo-orange text-white'
                : 'bg-white text-vivo-black/80 shadow-card'
            }`}
          >
            {m.content}
          </div>
        ))}
        {pending && (
          <div className="max-w-[85%] rounded-2xl bg-white px-4 py-2.5 text-sm text-vivo-black/40 shadow-card">
            Thinking…
          </div>
        )}
      </div>

      {error && <p className="px-4 pb-1 text-xs text-red-600">{error}</p>}

      <form onSubmit={sendMessage} className="flex gap-2 border-t border-vivo-black/5 p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="input-field"
          disabled={pending}
        />
        <button type="submit" className="btn-primary !px-5" disabled={pending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
