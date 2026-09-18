'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { addToCart } from '@/actions/cart';

const initialState = { success: false as boolean, error: '' as string | undefined };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending || disabled}>
      {pending ? 'Adding…' : disabled ? 'Out of stock' : 'Add to cart'}
    </button>
  );
}

export function AddToCartButton({ productId, inStock }: { productId: string; inStock: boolean }) {
  const [state, formAction] = useFormState(async (_prevState: typeof initialState, formData: FormData) => {
    const result = await addToCart(formData);
    return result.success ? { success: true, error: undefined } : { success: false, error: result.error };
  }, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={1} />
      <SubmitButton disabled={!inStock} />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Added to your cart.</p>}
    </form>
  );
}
