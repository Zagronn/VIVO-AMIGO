'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createPosCatalogItem } from '@/actions/pos';

const initialState = { success: false as boolean, error: '' as string | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? 'Adding…' : 'Add item'}
    </button>
  );
}

export function PosCatalogForm() {
  const [state, formAction] = useFormState(async (_prevState: typeof initialState, formData: FormData) => {
    const result = await createPosCatalogItem(formData);
    return result.success ? { success: true, error: undefined } : { success: false, error: result.error };
  }, initialState);

  return (
    <form action={formAction} className="glass-card space-y-4 p-6">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Item name
        </label>
        <input id="name" name="name" required maxLength={120} placeholder="e.g. Tamales (dozen)" className="input-field" />
      </div>

      <div>
        <label htmlFor="price" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Price (USD)
        </label>
        <input id="price" name="price" type="number" step="0.01" min="0.01" required className="input-field" />
      </div>

      <div>
        <label htmlFor="imageUrl" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Photo URL <span className="font-normal text-vivo-black/40">(optional)</span>
        </label>
        <input id="imageUrl" name="imageUrl" type="url" placeholder="https://…" className="input-field" />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Item added.</p>}

      <SubmitButton />
    </form>
  );
}
