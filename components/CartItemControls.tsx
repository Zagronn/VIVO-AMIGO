'use client';

import { useFormStatus } from 'react-dom';
import { removeCartItem, updateCartItemQuantity } from '@/actions/cart';

function IconButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-vivo-black/10 text-sm hover:border-vivo-orange disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function CartItemControls({ cartItemId, quantity }: { cartItemId: string; quantity: number }) {
  return (
    <div className="flex items-center gap-3">
      <form action={async (formData) => { await updateCartItemQuantity(formData); }}>
        <input type="hidden" name="cartItemId" value={cartItemId} />
        <input type="hidden" name="quantity" value={Math.max(1, quantity - 1)} />
        <IconButton>−</IconButton>
      </form>

      <span className="w-6 text-center text-sm font-medium">{quantity}</span>

      <form action={async (formData) => { await updateCartItemQuantity(formData); }}>
        <input type="hidden" name="cartItemId" value={cartItemId} />
        <input type="hidden" name="quantity" value={quantity + 1} />
        <IconButton>+</IconButton>
      </form>

      <form action={async (formData) => { await removeCartItem(formData); }}>
        <input type="hidden" name="cartItemId" value={cartItemId} />
        <button type="submit" className="ml-2 text-xs font-medium text-red-500 hover:underline">
          Remove
        </button>
      </form>
    </div>
  );
}
