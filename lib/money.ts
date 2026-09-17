import type { Prisma } from '@prisma/client';

/**
 * Formats a price as a USD-style currency string. Prices are stored as
 * Postgres `numeric(10,2)` via Prisma's Decimal type, which the client
 * returns as a Decimal.js instance (not a plain number) — this accepts
 * that, a plain number, or a numeric string so it works anywhere a price
 * shows up, including right after a `new Decimal(...)` write.
 */
export function formatPrice(value: Prisma.Decimal | number | string): string {
  const asNumber = typeof value === 'number' ? value : Number(value.toString());
  return asNumber.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

/** Multiplies a Decimal-ish unit price by a quantity and returns a plain number. */
export function multiplyPrice(unitPrice: Prisma.Decimal | number | string, quantity: number): number {
  const asNumber = typeof unitPrice === 'number' ? unitPrice : Number(unitPrice.toString());
  return asNumber * quantity;
}
