import { ContactForm } from '@/components/ContactForm';

export const metadata = {
  title: 'Contact — VIVO AMIGO',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <span className="glass-card inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-vivo-orange">
        Get in touch
      </span>
      <h1 className="mt-4 text-4xl font-extrabold leading-tight text-vivo-black sm:text-5xl">
        We're here to help
      </h1>
      <p className="mt-4 text-lg text-vivo-black/70">
        Have a question about an order, a listing, or becoming a seller? The VIVO SUPPORT AI
        assistant can answer most things instantly — for anything else, send us a message below.
      </p>

      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
