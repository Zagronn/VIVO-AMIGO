import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phone: string;
  itemTitle: string;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) throw new Error('phone must contain 8 to 15 digits');
  return digits;
}

export default function WhatsAppButton({ phone, itemTitle }: WhatsAppButtonProps) {
  if (!itemTitle.trim()) throw new Error('itemTitle is required');
  const message = encodeURIComponent(`Hola, me interesa el anuncio ${itemTitle.trim()}. ¿Podrías compartir más información?`);
  const whatsappUrl = `https://wa.me/${normalizePhone(phone)}?text=${message}`;
  return <motion.a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={`Contactar al vendedor por WhatsApp sobre ${itemTitle}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-bold text-white shadow-lg outline-none transition-colors hover:bg-green-600 focus-visible:ring-2 focus-visible:ring-green-300"><MessageCircle size={18} aria-hidden="true" />WhatsApp · Contactar vendedor</motion.a>;
}