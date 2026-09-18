import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatPrice, multiplyPrice } from '@/lib/money';
import { PosSendSmsForm } from '@/components/PosSendSmsForm';

export const dynamic = 'force-dynamic';

/**
 * Public by design (no auth check to view) — the customer scanning the QR
 * code or getting the SMS link is very likely not a signed-in VIVO AMIGO
 * user. Only the "send SMS" form below is restricted to the sale's owner.
 */
export default async function PosReceiptPage({ params }: { params: { receiptCode: string } }) {
  const sale = await db.posSale.findUnique({
    where: { receiptCode: params.receiptCode },
    include: { items: true, seller: true },
  });

  if (!sale) notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === sale.sellerId;

  const host = headers().get('host');
  const protocol = host?.startsWith('localhost') || host?.startsWith('127.0.0.1') ? 'http' : 'https';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${protocol}://${host}` : 'https://vivoamigo.com');
  const receiptUrl = `${siteUrl}/pos/receipt/${sale.receiptCode}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(receiptUrl)}`;

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <div className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-vivo-orange">VIVO POS receipt</p>
            <p className="mt-1 font-mono text-sm text-vivo-black/50">#{sale.receiptCode}</p>
          </div>
          <p className="text-xs text-vivo-black/40">{new Date(sale.createdAt).toLocaleString()}</p>
        </div>

        <p className="mt-3 text-sm text-vivo-black/60">Sold by {sale.seller.name}</p>

        <ul className="mt-5 divide-y divide-vivo-black/5 border-y border-vivo-black/5">
          {sale.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-vivo-black">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium">{formatPrice(multiplyPrice(item.unitPrice, item.quantity))}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-vivo-black">Total</span>
          <span className="text-xl font-extrabold text-vivo-orange">{formatPrice(sale.totalAmount)}</span>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 border-t border-vivo-black/5 pt-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- a plain
              external QR image, not something next/image needs to optimize */}
          <img src={qrSrc} alt="QR code linking to this receipt" width={160} height={160} className="rounded-xl" />
          <p className="text-xs text-vivo-black/40">Scan to save or share this receipt</p>
        </div>
      </div>

      {isOwner && (
        <div className="glass-card mt-4 p-5">
          <p className="text-sm font-semibold text-vivo-black">Send this receipt by SMS</p>
          <p className="mt-1 text-xs text-vivo-black/50">Only visible to you as the seller.</p>
          <div className="mt-3">
            <PosSendSmsForm receiptCode={sale.receiptCode} initialPhone={sale.customerPhone ?? ''} />
          </div>
        </div>
      )}
    </div>
  );
}
