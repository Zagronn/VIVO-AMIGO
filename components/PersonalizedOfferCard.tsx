'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PersonalizedOfferCardProps {
  sponsorBrand: string;
  offerMessage: string;
  actionLink: string;
}

export const PersonalizedOfferCard = ({ sponsorBrand, offerMessage, actionLink }: PersonalizedOfferCardProps) => {
  const safeActionLink = /^https:\/\/(wa\.me|www\.whatsapp\.com)\//.test(actionLink) ? actionLink : '#';

  return (
    <motion.aside whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="my-4 rounded-xl border border-black/5 bg-zinc-900/70 p-4 text-white shadow-sm backdrop-blur-md transition-shadow duration-300 hover:shadow-lg hover:shadow-black/5 dark:border-white/10 dark:bg-zinc-900/70 dark:hover:shadow-white/5" aria-label={`Oportunidad patrocinada de ${sponsorBrand}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="rounded border border-[#FF6A00]/20 bg-[#FF6A00]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#FF6A00]">Oportunidad Exclusiva · {sponsorBrand}</span>
        <span className="text-[9px] text-gray-400">Protegido por VIVO AMIGO Shield</span>
      </div>
      <p className="mb-3 text-xs font-medium leading-relaxed text-gray-200">{offerMessage}</p>
      <motion.a href={safeActionLink} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="inline-block rounded-lg bg-[#25D366] px-4 py-2 text-xs font-extrabold text-black transition-colors hover:bg-[#20ba5a]" aria-label={`Solicitar información de ${sponsorBrand} por WhatsApp`}>Solicitar Información por WhatsApp</motion.a>
    </motion.aside>
  );
};
