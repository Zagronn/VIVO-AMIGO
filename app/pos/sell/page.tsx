import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { PosRegister } from '@/components/PosRegister';

export const dynamic = 'force-dynamic';

export default async function PosSellPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/pos/sell');

  const catalogItems = await db.posCatalogItem.findMany({
    where: { sellerId: user.id, isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  if (catalogItems.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <p className="text-3xl">🏷️</p>
        <p className="mt-3 font-bold text-vivo-black">Add items before you can sell</p>
        <p className="mt-1 text-sm text-vivo-black/60">
          Your register fills in from your catalog — add a few items first.
        </p>
        <Link href="/pos/catalog" className="btn-primary mt-6 inline-flex">
          Go to catalog
        </Link>
      </div>
    );
  }

  const items = catalogItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price.toString()),
    imageUrl: item.imageUrl,
  }));

  return (
    <div className="px-4 pb-16 sm:px-6">
      <PosRegister items={items} />
    </div>
  );
}
