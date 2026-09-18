'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import { createProductReview } from '@/actions/reviews';

const initialState = { success: false as boolean, error: '' as string | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary !px-5 !py-2 text-sm" disabled={pending}>
      {pending ? 'Submitting…' : 'Submit review'}
    </button>
  );
}

export function ReviewForm({ productId, canReview }: { productId: string; canReview: boolean }) {
  const [rating, setRating] = useState(5);
  const [state, formAction] = useFormState(async (_prevState: typeof initialState, formData: FormData) => {
    const result = await createProductReview(formData);
    return result.success ? { success: true, error: undefined } : { success: false, error: result.error };
  }, initialState);

  if (!canReview) {
    return (
      <p className="rounded-xl bg-vivo-cream p-4 text-sm text-vivo-black/60">
        <a href="/login" className="font-semibold text-vivo-orange hover:underline">
          Sign in
        </a>{' '}
        to leave a review.
      </p>
    );
  }

  if (state.success) {
    return (
      <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
        Thanks — your review has been posted!
      </p>
    );
  }

  return (
    <form action={formAction} className="card space-y-4 p-5">
      <input type="hidden" name="productId" value={productId} />

      <div>
        <label className="mb-1 block text-sm font-medium text-vivo-black/70">Your rating</label>
        <div className="flex gap-1 text-2xl text-vivo-orange">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              {star <= rating ? '★' : '☆'}
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>

      <div>
        <label htmlFor="comment" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Your review
        </label>
        <textarea
          id="comment"
          name="comment"
          required
          rows={3}
          maxLength={2000}
          className="input-field"
          placeholder="What did you think?"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
