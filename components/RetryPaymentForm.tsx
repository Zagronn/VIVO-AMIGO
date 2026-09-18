'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { processOrderPayment } from '@/actions/payments';

const initialState = { success: false as boolean, error: '' as string | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? 'Processing…' : 'Retry payment'}
    </button>
  );
}

export function RetryPaymentForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [state, formAction] = useFormState(async (_prevState: typeof initialState, formData: FormData) => {
    const result = await processOrderPayment(formData);
    return result.success ? { success: true, error: undefined } : { success: false, error: result.error };
  }, initialState);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="orderId" value={orderId} />
      <SubmitButton />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
