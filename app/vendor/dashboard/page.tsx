import Image from 'next/image';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatPrice } from '@/lib/money';
import { toggleProductActive } from '@/actions/products';
import { CreateProductForm } from '@/components/CreateProductForm';

export const dynamic = 'force-dynamic';

export default async function VendorDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/vendor/dashboard');
  if (!user.vendorProfile || user.vendorProfile.status !== 'ACTIVE') redirect('/sell');

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { vendorId: user.vendorProfile.id },
      orderBy: { createdAt: 'desc' },
    }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black">{user.vendorProfile.storeName}</h1>
      <p className="mt-2 text-vivo-black/60">Manage your listings on VIVO AMIGO.</p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-bold text-vivo-black">Your products ({products.length})</h2>
          {products.length === 0 ? (
            <p className="glass-card p-6 text-sm text-vivo-black/50">
              You haven&apos;t listed anything yet — publish your first product using the form.
            </p>
          ) : (
            <ul className="space-y-3">
              {products.map((product) => (
                <li key={product.id} className="glass-card flex items-center gap-4 p-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-vivo-cream">
                    <Image
                      src={product.images[0] ?? 'https://picsum.photos/seed/vivo-fallback/200/200'}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-vivo-black">{product.title}</p>
                    <p className="text-sm text-vivo-black/50">
                      {formatPrice(product.price)} · {product.stockQuantity} in stock
                    </p>
                  </div>
                  <form action={toggleProductActive}>
                    <input type="hidden" name="productId" value={product.id} />
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        product.isActive
                          ? 'border border-vivo-black/10 bg-white text-vivo-black/60 hover:border-red-300 hover:text-red-600'
                          : 'bg-vivo-orange text-white hover:bg-vivo-orange-dark'
                      }`}
                    >
                      {product.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-vivo-black">List a new product</h2>
          <CreateProductForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
