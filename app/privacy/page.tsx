export const metadata = {
  title: 'Privacy Policy — VIVO AMIGO',
};

const sections = [
  {
    title: '1. What we collect',
    body: 'Account details (name, email), listings you post across the marketplace and classifieds (real estate, vehicles, jobs, second-hand goods), order and payment history, and messages you send through the contact form or the VIVO SUPPORT assistant.',
  },
  {
    title: '2. How we use it',
    body: 'To run your account, process orders through VIVO PAY, coordinate delivery through VIVO SHIP, show your listings to other users, and respond to support requests. We do not sell your personal data.',
  },
  {
    title: '3. The VIVO SUPPORT assistant',
    body: 'Messages you send to the AI support assistant are used to generate a helpful reply and are not used to identify you across the rest of the platform.',
  },
  {
    title: '4. Sharing',
    body: 'We share order details with the buyer, seller, and delivery carrier involved in that order, and nothing more — we don’t share your data with outside advertisers.',
  },
  {
    title: '5. Your choices',
    body: 'You can update or remove your listings at any time, and you can contact us to request that your account data be deleted.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-vivo-black sm:text-4xl">Privacy Policy</h1>
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
        Questions about your data? <a href="/contact" className="text-vivo-orange hover:underline">Contact us</a>.
      </p>
    </div>
  );
}
