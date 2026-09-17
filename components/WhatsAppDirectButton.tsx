import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

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
  <motion.a
    href={buildWhatsAppUrl(phone, title, isOfficialDealer)}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={isOfficialDealer ? `Programar prueba de manejo para ${title} por WhatsApp` : `Contactar al vendedor de ${title} por WhatsApp`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 font-extrabold text-black shadow-lg outline-none transition-colors hover:bg-[#20ba5a] focus-visible:ring-2 focus-visible:ring-green-200"
  >
    <MessageCircle size={20} aria-hidden="true" />
    <span>{isOfficialDealer ? 'Prueba de Manejo por WhatsApp' : 'Contactar al Vendedor (WhatsApp)'}</span>
  </motion.a>
);
