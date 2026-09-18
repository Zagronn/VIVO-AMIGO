'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { ActionResult } from '@/actions/reviews';

const initialState = { success: false as boolean, error: undefined as string | undefined };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export function AuthForm({
  action,
  fields,
  submitLabel,
  pendingLabel,
  next,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  fields: { name: string; label: string; type: string; autoComplete?: string }[];
  submitLabel: string;
  pendingLabel: string;
  next?: string;
}) {
  const [state, formAction] = useFormState(async (_prevState: typeof initialState, formData: FormData) => {
    const result = await action(formData);
    // A successful auth action redirects server-side and never returns here.
    return result.success ? { success: true, error: undefined } : { success: false, error: result.error };
  }, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-vivo-black/70">
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            required
            className="input-field"
          />
        </div>
      ))}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton label={submitLabel} pendingLabel={pendingLabel} />
    </form>
  );
}
