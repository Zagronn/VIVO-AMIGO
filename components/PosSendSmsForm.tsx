'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { sendPosReceiptSms } from '@/actions/pos';

const initialState = { success: false as boolean, error: '' as string | undefined };

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary !px-5" disabled={pending}>
      {pending ? 'Sending…' : 'Send'}
    </button>
  );
}

export function PosSendSmsForm({ receiptCode, initialPhone }: { receiptCode: string; initialPhone: string }) {
  const [state, formAction] = useFormState(async (_prevState: typeof initialState, formData: FormData) => {
    const result = await sendPosReceiptSms(formData);
    return result.success ? { success: true, error: undefined } : { success: false, error: result.error };
  }, initialState);

  if (state.success) {
    return <p className="text-sm text-green-700">Receipt sent by SMS.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="receiptCode" value={receiptCode} />
      <input
        type="tel"
        name="phone"
        defaultValue={initialPhone}
        placeholder="+502 5555 5555"
        required
        className="input-field"
      />
      <SendButton />
      {state.error && <p className="text-sm text-red-600 sm:basis-full">{state.error}</p>}
    </form>
  );
}
