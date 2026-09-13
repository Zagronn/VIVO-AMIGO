'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const spring = { type: 'spring' as const, stiffness: 400, damping: 25 };

export function GlobalHomeButton() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={spring}
      className="fixed left-3 top-3 z-[60] will-change-transform sm:left-5 sm:top-5"
    >
      <Link
        href="/"
        aria-label="Home / Ana Sayfa"
        title="Home / Ana Sayfa"
        className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#11151C]/90 px-3 py-2 text-white shadow-lg backdrop-blur-xl transition hover:border-[#FF6A00]/70 hover:shadow-[0_0_24px_rgba(255,106,0,.25)]"
      >
        <motion.span whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={spring} className="grid h-7 w-7 place-items-center rounded-lg bg-[#FF6A00] text-white">
          <Home size={16} aria-hidden="true" />
        </motion.span>
        <span className="hidden text-[11px] font-bold tracking-tight text-white/75 sm:inline">Ana Sayfa</span>
      </Link>
    </motion.div>
  );
}
