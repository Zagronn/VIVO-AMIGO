import Link from 'next/link';

const subBrands = [
  { label: 'VIVO PAY', href: '/pay' },
  { label: 'VIVO SHIP', href: '/ship' },
  { label: 'VIVO ADS', href: '/ads' },
  { label: 'VIVO BUSINESS', href: '/business' },
  { label: 'VIVO SUPPORT', href: '/support' },
];

const classifieds = [
  { label: 'Real estate', href: '/real-estate' },
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Second-hand', href: '/second-hand' },
];

const company = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Careers', href: '/careers' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
];

export function Footer() {
  return (
    <footer className="border-t border-vivo-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-extrabold">
              VIVO <span className="text-vivo-orange">AMIGO</span>
            </p>
            <p className="mt-1 text-sm text-vivo-black/60">
              The digital-ventures ecosystem for Latin America.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-vivo-black/40">Ecosystem</p>
            <ul className="mt-3 space-y-2 text-sm text-vivo-black/60">
              {subBrands.map((b) => (
                <li key={b.href}>
                  <Link href={b.href} className="hover:text-vivo-orange">
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-vivo-black/40">Classifieds</p>
            <ul className="mt-3 space-y-2 text-sm text-vivo-black/60">
              {classifieds.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="hover:text-vivo-orange">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-vivo-black/40">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-vivo-black/60">
              {company.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="hover:text-vivo-orange">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 text-xs text-vivo-black/40">
          © {new Date().getFullYear()} VIVO AMIGO. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
