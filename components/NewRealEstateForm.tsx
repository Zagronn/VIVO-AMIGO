'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createRealEstateListing } from '@/actions/realEstate';

const initialState = { success: false as boolean, error: '' as string | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
      {pending ? 'Publishing…' : 'Publish listing'}
    </button>
  );
}

export function NewRealEstateForm() {
  const [state, formAction] = useFormState(async (_prevState: typeof initialState, formData: FormData) => {
    const result = await createRealEstateListing(formData);
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
          <label htmlFor="listingType" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Listing type
          </label>
          <select id="listingType" name="listingType" className="input-field" defaultValue="SALE">
            <option value="SALE">For Sale</option>
            <option value="RENT">For Rent</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="propertyType" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Property type
        </label>
        <select id="propertyType" name="propertyType" className="input-field" defaultValue="HOUSE">
          <option value="HOUSE">House</option>
          <option value="APARTMENT">Apartment</option>
          <option value="LAND">Land</option>
          <option value="COMMERCIAL">Commercial</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="bedrooms" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Bedrooms
          </label>
          <input id="bedrooms" name="bedrooms" type="number" min="0" className="input-field" />
        </div>
        <div>
          <label htmlFor="bathrooms" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Bathrooms
          </label>
          <input id="bathrooms" name="bathrooms" type="number" min="0" className="input-field" />
        </div>
        <div>
          <label htmlFor="areaSqm" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Area (m²)
          </label>
          <input id="areaSqm" name="areaSqm" type="number" min="1" className="input-field" />
        </div>
      </div>

      <div>
        <label htmlFor="city" className="mb-1 block text-sm font-medium text-vivo-black/70">
          City
        </label>
        <input id="city" name="city" required minLength={2} maxLength={120} className="input-field" />
      </div>

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
      {state.success && <p className="text-sm text-green-700">Listing published.</p>}

      <SubmitButton />
    </form>
  );
}
