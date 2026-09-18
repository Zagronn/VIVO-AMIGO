import Link from 'next/link';

export const metadata = {
  title: 'Careers — VIVO AMIGO',
};

const values = [
  {
    title: 'Build for real people',
    description: 'Every product ships to solve a concrete problem for a buyer, a seller, or a driver — not to look good on a roadmap slide.',
  },
  {
    title: 'Move as one ecosystem',
    description: 'Marketplace, payments, shipping, ads, and support all share one account and one team — we build connected, not siloed.',
  },
  {
    title: 'Latin America first',
    description: 'We design around the realities of the region — address formats, payment habits, delivery coverage — instead of retrofitting a global template.',
  },
];

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <span className="glass-card inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-vivo-orange">
        Join the team
      </span>
      <h1 className="mt-4 text-4xl font-extrabold leading-tight text-vivo-black sm:text-5xl">
        Careers at VIVO AMIGO
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-vivo-black/70">
        We're a small team building a large ecosystem — marketplace, classifieds, payments,
        logistics, and AI support — for Latin America. We don't have open roles listed here yet,
        but we're always glad to hear from people who want to build this with us.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="glass-card p-6">
            <h2 className="font-bold text-vivo-black">{v.title}</h2>
            <p className="mt-2 text-sm text-vivo-black/60">{v.description}</p>
          </div>
        ))}
      </div>

      <div className="glass-card mt-10 p-6 text-center">
        <p className="text-vivo-black/70">Don't see a listed role that fits? Reach out anyway.</p>
        <Link href="/contact" className="btn-primary mt-4 inline-flex">
          Contact us
        </Link>
      </div>
    </div>
  );
}
