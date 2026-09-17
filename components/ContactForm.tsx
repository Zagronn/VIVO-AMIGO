'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitContactMessage } from '@/actions/contact';

const initialState = { success: false as boolean, error: '' as string | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
      {pending ? 'Sending…' : 'Send message'}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useFormState(async (_prevState: typeof initialState, formData: FormData) => {
    const result = await submitContactMessage(formData);
    return result.success ? { success: true, error: undefined } : { success: false, error: result.error };
  }, initialState);

  if (state.success) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="font-bold text-vivo-black">Message sent.</p>
        <p className="mt-1 text-sm text-vivo-black/60">Thanks for reaching out — our team will get back to you soon.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="glass-card space-y-4 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Name
          </label>
          <input id="name" name="name" required maxLength={160} className="input-field" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input-field" />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Subject
        </label>
        <input id="subject" name="subject" required minLength={2} maxLength={200} className="input-field" />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Message
        </label>
        <textarea id="message" name="message" required minLength={10} maxLength={5000} rows={5} className="input-field" />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
