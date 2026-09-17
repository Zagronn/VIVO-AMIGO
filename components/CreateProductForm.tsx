'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createProduct } from '@/actions/products';

const initialState = { success: false as boolean, error: '' as string | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
      {pending ? 'Publishing…' : 'Publish product'}
    </button>
  );
}

export function CreateProductForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, formAction] = useFormState(async (_prevState: typeof initialState, formData: FormData) => {
    const result = await createProduct(formData);
    return result.success ? { success: true, error: undefined } : { success: false, error: result.error };
  }, initialState);

  return (
    <form action={formAction} className="glass-card space-y-4 p-6">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Title
        </label>
        <input id="title" name="title" required minLength={2} maxLength={200} className="input-field" />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Description
        </label>
        <textarea id="description" name="description" rows={3} maxLength={5000} className="input-field" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Price (USD)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="stockQuantity" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Stock
          </label>
          <input id="stockQuantity" name="stockQuantity" type="number" min="0" defaultValue={0} className="input-field" />
        </div>
      </div>

      {categories.length > 0 && (
        <div>
          <label htmlFor="categoryId" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Category
          </label>
          <select id="categoryId" name="categoryId" className="input-field" defaultValue="">
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="imageUrl" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Image URL
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          required
          placeholder="https://…"
          className="input-field"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Product published.</p>}

      <SubmitButton />
    </form>
  );
}
