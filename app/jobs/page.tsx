import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/money';
import { ClassifiedCard } from '@/components/ClassifiedCard';

export const dynamic = 'force-dynamic';

const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};

function salaryLabel(min: number | null, max: number | null): string {
  if (min && max) return `${formatPrice(min)} – ${formatPrice(max)}`;
  if (min) return `${formatPrice(min)}+`;
  if (max) return `Up to ${formatPrice(max)}`;
  return 'Salary not disclosed';
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { location?: string; employmentType?: string; remote?: string };
}) {
  const { location, employmentType, remote } = searchParams;

  const listings = await db.jobListing.findMany({
    where: {
      isActive: true,
      ...(location ? { location: { contains: location, mode: 'insensitive' } } : {}),
      ...(employmentType ? { employmentType: employmentType as any } : {}),
      ...(remote === 'true' ? { remote: true } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-vivo-black">Jobs</h1>
          <p className="mt-2 text-vivo-black/60">Find your next role from employers across the region.</p>
        </div>
        <Link href="/jobs/new" className="btn-primary">
          Post a job
        </Link>
      </div>

      <form method="get" className="glass-card mt-6 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label htmlFor="location" className="mb-1 block text-xs font-medium text-vivo-black/70">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={location ?? ''}
            placeholder="e.g. Guatemala City"
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="employmentType" className="mb-1 block text-xs font-medium text-vivo-black/70">
            Employment type
          </label>
          <select
            id="employmentType"
            name="employmentType"
            defaultValue={employmentType ?? ''}
            className="input-field"
          >
            <option value="">Any</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pb-2.5">
          <input
            id="remote"
            name="remote"
            type="checkbox"
            value="true"
            defaultChecked={remote === 'true'}
            className="h-4 w-4 rounded border-vivo-black/20"
          />
          <label htmlFor="remote" className="text-sm font-medium text-vivo-black/70">
            Remote only
          </label>
        </div>

        <button type="submit" className="btn-secondary">
          Filter
        </button>
      </form>

      {listings.length === 0 ? (
        <p className="mt-12 text-center text-vivo-black/50">No jobs match your search yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {listings.map((listing) => (
            <ClassifiedCard
              key={listing.id}
              href={`/jobs/${listing.id}`}
              image={undefined}
              badge={employmentTypeLabels[listing.employmentType]}
              title={listing.title}
              priceLabel={salaryLabel(listing.salaryMin, listing.salaryMax)}
              meta={[listing.company, listing.location, listing.remote ? 'Remote' : null].filter(
                (x): x is string => Boolean(x)
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
