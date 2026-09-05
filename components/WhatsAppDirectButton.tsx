interface WhatsAppDirectButtonProps {
  phone: string;
  title: string;
  isOfficialDealer?: boolean;
}

function buildWhatsAppUrl(phone: string, title: string, isOfficialDealer: boolean): string {
  const normalizedPhone = phone.replace(/[^\d+]/g, '');
  const message = isOfficialDealer
    ? `Hola BYD Guatemala! Me interesa programar una prueba de manejo (Test Drive) para ${title}.`
    : `Hola! Me interesa comprar tu producto "${title}" publicado en VIVO AMIGO.`;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export const WhatsAppDirectButton = ({
  phone,
  title,
  isOfficialDealer = false
}: WhatsAppDirectButtonProps) => (
  <a
    href={buildWhatsAppUrl(phone, title, isOfficialDealer)}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={isOfficialDealer ? `Programar prueba de manejo para ${title} por WhatsApp` : `Contactar al vendedor de ${title} por WhatsApp`}
    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 font-extrabold text-black shadow-lg transition-transform hover:bg-[#20ba5a] active:scale-95"
  >
    <span className="text-xl" aria-hidden="true">💬</span>
    <span>{isOfficialDealer ? 'Prueba de Manejo por WhatsApp' : 'Contactar al Vendedor (WhatsApp)'}</span>
  </a>
);
