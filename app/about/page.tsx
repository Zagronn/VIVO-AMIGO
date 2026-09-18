export const metadata = {
  title: 'About — VIVO AMIGO',
};

const stats = [
  { label: 'Ecosystem brands', value: '6' },
  { label: 'Listing categories', value: '5' },
  { label: 'Built for', value: 'Latin America' },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <span className="glass-card inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-vivo-orange">
        Our story
      </span>
      <h1 className="mt-4 text-4xl font-extrabold leading-tight text-vivo-black sm:text-5xl">
        One account, a whole ecosystem
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-vivo-black/70">
        <span className="notranslate" translate="no">VIVO AMIGO</span> started as a single marketplace and grew into a family of connected products —
        payments, shipping, advertising, seller tools, and AI-powered support — all built around
        the everyday needs of buyers and sellers across Latin America.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-6 text-center">
            <p className="text-2xl font-extrabold text-vivo-orange">{s.value}</p>
            <p className="mt-1 text-sm text-vivo-black/60">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 space-y-6 text-vivo-black/70">
        <div>
          <h2 className="text-xl font-bold text-vivo-black">What we're building</h2>
          <p className="mt-2">
            Beyond the core marketplace, <span className="notranslate" translate="no">VIVO AMIGO</span> now covers classifieds for real estate,
            vehicles, jobs, and second-hand goods — so people can buy, sell, rent, and hire without
            leaving the platform they already trust.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-vivo-black">How the ecosystem fits together</h2>
          <p className="mt-2">
            VIVO PAY handles checkout, VIVO SHIP coordinates last-mile delivery, VIVO ADS helps
            sellers get discovered, VIVO BUSINESS gives sellers the tools to run their store, and
            VIVO SUPPORT puts an AI assistant in front of anyone who needs help — all from one
            account.
          </p>
        </div>
      </div>
    </div>
  );
}
