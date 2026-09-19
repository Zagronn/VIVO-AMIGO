'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { recordPosSale } from '@/actions/pos';
import { Trash2, Plus, Minus, ShoppingCart, Receipt, User, CreditCard, CheckCircle, Activity } from 'lucide-react';

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
    // Storage blocked
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
            queue = queue.filter((s) => s.clientSaleId !== sale.clientSaleId);
            writeQueue(queue);
            setPendingCount(queue.length);
          }
        } catch {
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
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f] p-4">
        <div className="w-full max-w-sm p-8 border border-orange-500/30 bg-black/60 backdrop-blur-xl rounded-sm text-center shadow-[0_0_30px_rgba(255,107,0,0.1)]">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-orange-500 rounded-full animate-bounce">
              <CheckCircle className="text-white" size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Sale Complete</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Transaction Registered</p>

          <div className="p-4 bg-black/50 border border-orange-500/20 rounded-sm mb-8">
            <p className="text-[10px] text-orange-500/50 uppercase mb-1">Receipt Code</p>
            <p className="text-3xl font-mono font-bold text-orange-400">{completedReceipt}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href={`/pos/receipt/${completedReceipt}`} className="w-full py-3 bg-orange-500 text-white font-bold uppercase text-xs tracking-widest rounded-sm hover:bg-orange-600 transition-all shadow-[0_0_15px_rgba(255,107,0,0.3)]">
              View Digital Receipt
            </Link>
            <button
              type="button"
              onClick={() => setCompletedReceipt(undefined)}
              className="w-full py-3 border border-orange-500/30 text-orange-500 font-bold uppercase text-xs tracking-widest rounded-sm hover:bg-orange-500/10 transition-all"
            >
              New Sale
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-300 font-mono p-4 lg:p-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Product Selection Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-orange-500/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg shadow-[0_0_10px_rgba(255,107,0,0.4)]">
                <ShoppingCart className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Quick Register</h2>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500 text-[10px] font-bold uppercase animate-pulse">
                <Activity size={12} /> {pendingCount} Pending Sync
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addToCart(item)}
                className="group relative p-4 border border-orange-500/20 bg-black/40 backdrop-blur-sm rounded-sm text-left transition-all hover:border-orange-500 hover:bg-orange-500/5 active:scale-95"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition-colors">{item.name}</span>
                  <span className="text-sm font-mono font-bold text-orange-500">${item.price.toFixed(2)}</span>
                </div>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={14} className="text-orange-500" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart / Checkout Area */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 border border-orange-500/30 bg-black/60 backdrop-blur-xl rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="p-4 border-b border-orange-500/30 bg-orange-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-orange-500" size={18} />
                <span className="text-xs font-bold uppercase tracking-widest text-white">Current Cart</span>
              </div>
              <span className="text-xs font-mono text-orange-400">{cart.length} items</span>
            </div>

            <div className="p-4 min-h-[300px] max-h-[50vh] overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 opacity-30 text-center">
                  <ShoppingCart size={48} className="mb-4" />
                  <p className="text-xs uppercase tracking-widest">Cart is empty</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {cart.map((line) => (
                    <li key={line.catalogItemId} className="flex items-center justify-between gap-3 p-2 border border-orange-500/10 bg-white/5 rounded-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{line.name}</p>
                        <p className="text-[10px] text-gray-500">${line.unitPrice.toFixed(2)} / unit</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => changeQty(line.catalogItemId, -1)}
                          className="h-6 w-6 flex items-center justify-center rounded-sm border border-orange-500/30 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-mono font-bold w-4 text-center">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => changeQty(line.catalogItemId, 1)}
                          className="h-6 w-6 flex items-center justify-center rounded-sm border border-orange-500/30 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-xs font-mono font-bold text-orange-400 w-16 text-right">
                        ${(line.unitPrice * line.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 border-t border-orange-500/30 bg-black/40">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs uppercase tracking-widest opacity-50">Grand Total</span>
                <span className="text-2xl font-black text-white tracking-tighter">${total.toFixed(2)}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="customerPhone" className="mb-1 block text-[10px] uppercase tracking-widest text-gray-500">
                    Customer Phone <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                    <input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+502 0000 0000"
                      className="w-full rounded-sm border border-orange-500/20 bg-black/20 py-2 pl-9 pr-4 text-xs text-white placeholder:text-gray-700 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-2 rounded-sm bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] text-center font-bold">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCharge}
                  disabled={cart.length === 0 || charging}
                  className="w-full py-3 bg-orange-500 text-white font-black uppercase text-xs tracking-widest rounded-sm hover:bg-orange-600 transition-all shadow-[0_0_15px_rgba(255,107,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {charging ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Charge ${total.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
