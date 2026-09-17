export const metadata = {
  title: 'Terms of Service — VIVO AMIGO',
};

const sections = [
  {
    title: '1. Using VIVO AMIGO',
    body: 'By creating an account or using any part of the VIVO AMIGO ecosystem — the marketplace, classifieds (real estate, vehicles, jobs, second-hand goods), VIVO PAY, VIVO SHIP, VIVO ADS, VIVO BUSINESS, or VIVO SUPPORT — you agree to use the platform honestly and in line with these terms.',
  },
  {
    title: '2. Listings and accuracy',
    body: 'Sellers and posters are responsible for the accuracy of their own listings — products, real estate, vehicles, jobs, and second-hand items alike. Listings must not be fraudulent, misleading, or for anything illegal to sell, rent, or advertise.',
  },
  {
    title: '3. Payments and orders',
    body: 'Orders placed through VIVO AMIGO are processed via VIVO PAY. Once an order is paid, VIVO SHIP coordinates dispatch and delivery. Refunds and disputes are handled case by case — contact us if something goes wrong with an order.',
  },
  {
    title: '4. Accounts',
    body: 'You are responsible for keeping your account credentials secure. VIVO AMIGO may suspend accounts that violate these terms, post fraudulent listings, or abuse the platform.',
  },
  {
    title: '5. Changes to these terms',
    body: 'We may update these terms as the ecosystem grows. Continued use of VIVO AMIGO after a change means you accept the updated terms.',
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black sm:text-4xl">Terms of Service</h1>
      <p className="mt-2 text-sm text-vivo-black/50">Last updated {new Date().getFullYear()}</p>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-lg font-bold text-vivo-black">{s.title}</h2>
            <p className="mt-2 text-vivo-black/70">{s.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-vivo-black/50">
        Questions about these terms? <a href="/contact" className="text-vivo-orange hover:underline">Contact us</a>.
      </p>
    </div>
  );
}
