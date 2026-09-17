'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createVehicleListing } from '@/actions/vehicles';

const initialState = { success: false as boolean, error: '' as string | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
      {pending ? 'Publishing…' : 'Publish listing'}
    </button>
  );
}

export function NewVehicleForm() {
  const [state, formAction] = useFormState(async (_prevState: typeof initialState, formData: FormData) => {
    const result = await createVehicleListing(formData);
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
          <label htmlFor="condition" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Condition
          </label>
          <select id="condition" name="condition" className="input-field" defaultValue="USED">
            <option value="NEW">New</option>
            <option value="USED">Used</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="make" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Make
          </label>
          <input id="make" name="make" required maxLength={80} className="input-field" />
        </div>
        <div>
          <label htmlFor="model" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Model
          </label>
          <input id="model" name="model" required maxLength={80} className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="year" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Year
          </label>
          <input id="year" name="year" type="number" required min={1950} className="input-field" />
        </div>
        <div>
          <label htmlFor="mileageKm" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Mileage (km)
          </label>
          <input id="mileageKm" name="mileageKm" type="number" min={0} className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="transmission" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Transmission
          </label>
          <input
            id="transmission"
            name="transmission"
            maxLength={40}
            placeholder="Automatic/Manual"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="fuelType" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Fuel type
          </label>
          <input id="fuelType" name="fuelType" maxLength={40} className="input-field" />
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
