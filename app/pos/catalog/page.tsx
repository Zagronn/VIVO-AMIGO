import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/money';
import { togglePosCatalogItemActive } from '@/actions/pos';
import { PosCatalogForm } from '@/components/PosCatalogForm';

export const dynamic = 'force-dynamic';

export default async function PosCatalogPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/pos/catalog');

  const items = await db.posCatalogItem.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold text-vivo-black">Your catalog</h1>
      <p className="mt-1 text-sm text-vivo-black/60">
        A quick price list — no stock counts to manage, just name, price, and an optional photo.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {items.length === 0 ? (
            <p className="glass-card p-6 text-sm text-vivo-black/50">
              No items yet — add your first one using the form.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="glass-card flex items-center gap-4 p-4">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-vivo-cream">
                    <Image
                      src={item.imageUrl ?? 'https://picsum.photos/seed/vivo-pos-fallback/200/200'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-vivo-black">{item.name}</p>
                    <p className="text-sm text-vivo-black/50">{formatPrice(item.price)}</p>
                  </div>
                  <form
                    action={async (formData) => {
                      'use server';
                      await togglePosCatalogItemActive(formData);
                    }}
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        item.isActive
                          ? 'border border-vivo-black/10 bg-white text-vivo-black/60 hover:border-red-300 hover:text-red-600'
                          : 'bg-vivo-orange text-white hover:bg-vivo-orange-dark'
                      }`}
                    >
                      {item.isActive ? 'Hide' : 'Show'}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2">
          <PosCatalogForm />
        </div>
      </div>
    </div>
  );
}
