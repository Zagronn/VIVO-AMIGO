'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { applyToBecomeVendor } from '@/actions/vendors';

const initialState = { success: false as boolean, error: '' as string | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
      {pending ? 'Submitting…' : 'Apply to sell'}
    </button>
  );
}

export function ApplyVendorForm() {
  const [state, formAction] = useFormState(async (_prevState: typeof initialState, formData: FormData) => {
    const result = await applyToBecomeVendor(formData);
    return result.success ? { success: true, error: undefined } : { success: false, error: result.error };
  }, initialState);

  if (state.success) {
    return (
      <p className="glass-card p-4 text-sm text-green-700">
        Application submitted — an admin will review it shortly.
      </p>
    );
  }

  return (
    <form action={formAction} className="glass-card space-y-4 p-6">
      <div>
        <label htmlFor="storeName" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Store name
        </label>
        <input
          id="storeName"
          name="storeName"
          required
          minLength={2}
          maxLength={120}
          className="input-field"
          placeholder="e.g. Casa Textiles GT"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
