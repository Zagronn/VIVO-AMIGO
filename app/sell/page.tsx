import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { ApplyVendorForm } from '@/components/ApplyVendorForm';

export const dynamic = 'force-dynamic';

const statusCopy: Record<string, { title: string; body: string }> = {
  PENDING: {
    title: 'Your application is under review',
    body: "We'll notify you once an admin approves your store. This usually takes a day or two.",
  },
  ACTIVE: {
    title: 'You are an approved seller',
    body: 'Head to your seller dashboard to list products and manage your catalog.',
  },
  SUSPENDED: {
    title: 'Your seller account is suspended',
    body: 'Contact support if you believe this is a mistake.',
  },
};

export default async function SellPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black">Sell on VIVO AMIGO</h1>
      <p className="mt-2 text-vivo-black/60">
        Reach shoppers across Latin America. Applications are reviewed by our admin team.
      </p>

      <div className="mt-8">
        {!user ? (
          <p className="glass-card p-4 text-sm text-vivo-black/60">
            <Link href="/login?next=/sell" className="font-semibold text-vivo-orange hover:underline">
              Sign in
            </Link>{' '}
            to apply as a seller.
          </p>
        ) : user.vendorProfile ? (
          <div className="glass-card p-6">
            <h2 className="font-bold text-vivo-black">{statusCopy[user.vendorProfile.status].title}</h2>
            <p className="mt-2 text-sm text-vivo-black/60">{statusCopy[user.vendorProfile.status].body}</p>
            {user.vendorProfile.status === 'ACTIVE' && (
              <Link href="/vendor/dashboard" className="btn-primary mt-4 inline-flex">
                Go to seller dashboard
              </Link>
            )}
          </div>
        ) : (
          <ApplyVendorForm />
        )}
      </div>
    </div>
  );
}
