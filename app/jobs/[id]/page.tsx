import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { formatPrice } from '@/lib/money';
import { toggleJobListingActive } from '@/actions/jobs';

export const dynamic = 'force-dynamic';

const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};

function salaryLabel(min: number | null, max: number | null): string {
  if (min && max) return `${formatPrice(min)} to ${formatPrice(max)}`;
  if (min) return `${formatPrice(min)}+`;
  if (max) return `Up to ${formatPrice(max)}`;
  return 'Salary not disclosed';
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const [listing, user] = await Promise.all([
    db.jobListing.findUnique({
      where: { id: params.id },
      include: { poster: true },
    }),
    getCurrentUser(),
  ]);

  if (!listing) notFound();

  const canManage = !!user && (user.id === listing.posterId || user.role === 'ADMIN');

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-vivo-black/70">
          {employmentTypeLabels[listing.employmentType]}
        </span>
        {listing.remote && (
          <span className="rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-vivo-black/70">
            Remote
          </span>
        )}
        {!listing.isActive && (
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700">
            Closed
          </span>
        )}
      </div>

      <h1 className="mt-2 text-3xl font-extrabold text-vivo-black">{listing.title}</h1>
      <p className="mt-1 text-lg text-vivo-black/70">{listing.company}</p>
      <p className="mt-1 text-sm text-vivo-black/50">{listing.location}</p>

      <p className="mt-4 text-2xl font-bold text-vivo-orange">
        {salaryLabel(listing.salaryMin, listing.salaryMax)}
      </p>

      <div className="mt-8">
        <h2 className="mb-2 text-lg font-bold text-vivo-black">About this role</h2>
        <p className="whitespace-pre-line text-vivo-black/70">{listing.description}</p>
      </div>

      <div className="glass-card mt-10 p-6">
        <h2 className="mb-2 text-lg font-bold text-vivo-black">Apply</h2>
        <p className="mb-4 text-sm text-vivo-black/60">
          Interested? Reach out to the poster directly to apply.
        </p>
        <a
          href={`mailto:${listing.poster.email}?subject=${encodeURIComponent('Application: ' + listing.title)}`}
          className="btn-primary inline-block"
        >
          Apply via email
        </a>
      </div>

      {canManage && (
        <div className="mt-6">
          <form
            action={async (formData) => {
              'use server';
              await toggleJobListingActive(formData);
            }}
          >
            <input type="hidden" name="id" value={listing.id} />
            <button
              type="submit"
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                listing.isActive
                  ? 'border border-vivo-black/10 bg-white text-vivo-black/60 hover:border-red-300 hover:text-red-600'
                  : 'bg-vivo-orange text-white hover:bg-vivo-orange-dark'
              }`}
            >
              {listing.isActive ? 'Close listing' : 'Reopen listing'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
