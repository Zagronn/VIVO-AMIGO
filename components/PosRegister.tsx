'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { recordPosSale } from '@/actions/pos';

type CatalogItem = { id: string; name: string; price: number; imageUrl: string | null };
type CartLine = { catalogItemId: string; name: string; unitPrice: number; quantity: number };

type PendingSale = {
  clientSaleId: string;
  receiptCode: string;
  items: { catalogItemId?: string; name: string; unitPrice: number; quantity: number }[];
  customerPhone: string;
  createdAt: string;
};

const QUEUE_KEY = 'vivo_pos_pending_sales';

/** Random, short, QR/SMS-friendly code — generated on-device so it exists
 * immediately, before this sale has ever reached the server. */
function generateReceiptCode(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const time = Date.now().toString(36).slice(-4).toUpperCase();
  return `${rand}${time}`;
}

function generateClientSaleId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `sale-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readQueue(): PendingSale[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as PendingSale[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: PendingSale[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Best-effort — a private-browsing tab with storage blocked just won't
    // keep an offline queue across reloads; the current session still works.
  }
}

function saleToFormData(sale: PendingSale): FormData {
  const formData = new FormData();
  formData.set('clientSaleId', sale.clientSaleId);
  formData.set('receiptCode', sale.receiptCode);
  formData.set('items', JSON.stringify(sale.items));
  formData.set('customerPhone', sale.customerPhone);
  return formData;
}

export function PosRegister({ items }: { items: CatalogItem[] }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [charging, setCharging] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [completedReceipt, setCompletedReceipt] = useState<string | undefined>(undefined);
  const [pendingCount, setPendingCount] = useState(0);
  const syncing = useRef(false);

  const total = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  const syncPendingSales = useCallback(async () => {
    if (syncing.current || !navigator.onLine) return;
    syncing.current = true;
    try {
      let queue = readQueue();
      for (const sale of queue) {
        try {
          const result = await recordPosSale(saleToFormData(sale));
          if (result.success) {
            queue = queue.filter((s) => s.clientSaleId !== sale.clientSaleId);
            writeQueue(queue);
            setPendingCount(queue.length);
          } else {
            // A real validation error (not a network error) — drop it so it
            // doesn't block the rest of the queue forever, rather than retry
            // something that can never succeed.
            queue = queue.filter((s) => s.clientSaleId !== sale.clientSaleId);
            writeQueue(queue);
            setPendingCount(queue.length);
          }
        } catch {
          // Still offline / request failed — stop and try again next time.
          break;
        }
      }
    } finally {
      syncing.current = false;
    }
  }, []);

  useEffect(() => {
    setPendingCount(readQueue().length);
    syncPendingSales();
    window.addEventListener('online', syncPendingSales);
    return () => window.removeEventListener('online', syncPendingSales);
  }, [syncPendingSales]);

  function addToCart(item: CatalogItem) {
    setCart((prev) => {
      const existing = prev.find((l) => l.catalogItemId === item.id);
      if (existing) {
        return prev.map((l) => (l.catalogItemId === item.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { catalogItemId: item.id, name: item.name, unitPrice: item.price, quantity: 1 }];
    });
  }

  function changeQty(catalogItemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.catalogItemId === catalogItemId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    );
  }

  async function handleCharge() {
    if (cart.length === 0 || charging) return;
    setCharging(true);
    setError(undefined);

    const sale: PendingSale = {
      clientSaleId: generateClientSaleId(),
      receiptCode: generateReceiptCode(),
      items: cart.map((l) => ({
        catalogItemId: l.catalogItemId,
        name: l.name,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
      })),
      customerPhone: customerPhone.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!navigator.onLine) {
      const queue = readQueue();
      queue.push(sale);
      writeQueue(queue);
      setPendingCount(queue.length);
      setCart([]);
      setCustomerPhone('');
      setCompletedReceipt(sale.receiptCode);
      setCharging(false);
      return;
    }

    try {
      const result = await recordPosSale(saleToFormData(sale));
      if (result.success) {
        setCart([]);
        setCustomerPhone('');
        setCompletedReceipt(result.data.receiptCode);
      } else {
        setError(result.error);
      }
    } catch {
      // The network dropped mid-request — fall back to the offline queue
      // instead of losing the sale.
      const queue = readQueue();
      queue.push(sale);
      writeQueue(queue);
      setPendingCount(queue.length);
      setCart([]);
      setCustomerPhone('');
      setCompletedReceipt(sale.receiptCode);
    } finally {
      setCharging(false);
    }
  }

  if (completedReceipt) {
    return (
      <div className="glass-card mx-auto mt-6 max-w-sm p-8 text-center">
        <p className="text-4xl">✅</p>
        <p className="mt-3 text-lg font-bold text-vivo-black">Sale complete</p>
        <p className="mt-1 text-sm text-vivo-black/60">
          Receipt <span className="font-mono font-semibold">{completedReceipt}</span>
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link href={`/pos/receipt/${completedReceipt}`} className="btn-primary">
            View / share receipt
          </Link>
          <button type="button" className="btn-secondary" onClick={() => setCompletedReceipt(undefined)}>
            New sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        {pendingCount > 0 && (
          <p className="mb-3 rounded-full bg-amber-100 px-4 py-1.5 text-center text-xs font-semibold text-amber-700">
            {pendingCount} sale{pendingCount === 1 ? '' : 's'} waiting to sync
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addToCart(item)}
              className="glass-card flex flex-col items-start gap-1 p-4 text-left transition hover:border-vivo-orange active:scale-95"
            >
              <span className="font-semibold text-vivo-black">{item.name}</span>
              <span className="text-sm font-bold text-vivo-orange">${item.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="glass-card sticky top-24 p-5">
          <p className="font-bold text-vivo-black">Cart</p>
          {cart.length === 0 ? (
            <p className="mt-4 text-sm text-vivo-black/50">Tap an item to add it.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {cart.map((line) => (
                <li key={line.catalogItemId} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex-1 text-vivo-black">{line.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeQty(line.catalogItemId, -1)}
                      className="h-6 w-6 rounded-full border border-vivo-black/10 text-vivo-black/60 hover:border-vivo-orange"
                    >
                      −
                    </button>
                    <span className="w-4 text-center">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(line.catalogItemId, 1)}
                      className="h-6 w-6 rounded-full border border-vivo-black/10 text-vivo-black/60 hover:border-vivo-orange"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-16 text-right font-semibold">${(line.unitPrice * line.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-vivo-black/5 pt-4">
            <span className="font-bold text-vivo-black">Total</span>
            <span className="text-xl font-extrabold text-vivo-orange">${total.toFixed(2)}</span>
          </div>

          <div className="mt-4">
            <label htmlFor="customerPhone" className="mb-1 block text-xs font-medium text-vivo-black/60">
              Customer phone (optional, for the receipt)
            </label>
            <input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+502 5555 5555"
              className="input-field"
            />
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleCharge}
            disabled={cart.length === 0 || charging}
            className="btn-primary mt-4 w-full"
          >
            {charging ? 'Charging…' : `Charge $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
