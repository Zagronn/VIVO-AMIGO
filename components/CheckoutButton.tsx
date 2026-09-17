'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { checkoutCart } from '@/actions/orders';
import { formatPrice } from '@/lib/money';

const initialState = { success: false as boolean, error: '' as string | undefined };

function SubmitButton({ totalAmount }: { totalAmount: number }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? 'Processing…' : `Pay ${formatPrice(totalAmount)} now`}
    </button>
  );
}

export function CheckoutButton({ totalAmount }: { totalAmount: number }) {
  // checkoutCart redirects on success, so this state only ever surfaces
  // the failure path (e.g. an item went out of stock after the page loaded).
  const [state, formAction] = useFormState(async (_prevState: typeof initialState) => {
    const result = await checkoutCart();
    return result.success === false ? { success: false, error: result.error } : initialState;
  }, initialState);

  return (
    <form action={formAction}>
      <SubmitButton totalAmount={totalAmount} />
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
