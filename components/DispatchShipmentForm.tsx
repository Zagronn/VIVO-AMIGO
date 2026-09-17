'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { createOrderShipment } from '@/actions/shipments';

const initialState = { success: false as boolean, error: '' as string | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? 'Dispatching…' : 'Dispatch shipment'}
    </button>
  );
}

export function DispatchShipmentForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [state, formAction] = useFormState(async (_prevState: typeof initialState, formData: FormData) => {
    const result = await createOrderShipment(formData);
    return result.success ? { success: true, error: undefined } : { success: false, error: result.error };
  }, initialState);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <div>
        <label htmlFor="carrier" className="mb-1 block text-xs font-medium text-vivo-black/60">
          Carrier
        </label>
        <select id="carrier" name="carrier" className="input-field" defaultValue="VIVO_LOGISTICS">
          <option value="VIVO_LOGISTICS">VIVO Logistics</option>
          <option value="DHL">DHL</option>
          <option value="FEDEX">FedEx</option>
        </select>
      </div>
      <SubmitButton />
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
