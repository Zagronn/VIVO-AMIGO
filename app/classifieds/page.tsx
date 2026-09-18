import Link from 'next/link';

const sections = [
  {
    href: '/real-estate',
    name: 'Real Estate',
    description: 'Houses, apartments, land and commercial spaces for sale or rent.',
    emoji: '🏠',
  },
  {
    href: '/vehicles',
    name: 'Vehicles',
    description: 'Cars, trucks and motorcycles — new and used, direct from owners.',
    emoji: '🚗',
  },
  {
    href: '/jobs',
    name: 'Jobs',
    description: 'Full-time, part-time, contract and remote roles from local companies.',
    emoji: '💼',
  },
  {
    href: '/second-hand',
    name: 'Second-hand',
    description: 'Buy and sell used items directly with people near you.',
    emoji: '📦',
  },
];

export default function ClassifiedsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black sm:text-4xl">Classifieds</h1>
      <p className="mt-2 max-w-2xl text-vivo-black/60">
        Beyond the marketplace, VIVO AMIGO is also where people buy, sell, hire and get hired —
        no vendor approval needed, just sign in and post.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="glass-card flex items-start gap-4 p-6">
            <span className="text-3xl">{s.emoji}</span>
            <div>
              <h2 className="text-lg font-bold text-vivo-black">{s.name}</h2>
              <p className="mt-1 text-sm text-vivo-black/60">{s.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
