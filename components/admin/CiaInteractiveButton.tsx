'use client';

import React from 'react';
import { playSciFiSound } from '@/utils/ciaAudioEngine';

export default function CiaInteractiveButton({
  label,
  onClick,
  variant = 'beep',
  className = ''
}: {
  label: string;
  onClick?: () => void;
  variant?: 'beep' | 'radar' | 'error' | 'success';
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        playSciFiSound(variant);
        if (onClick) onClick();
      }}
      className={`border border-[#ff5500] bg-black text-[#ff5500] px-4 py-2 font-mono text-xs uppercase tracking-widest relative overflow-hidden group hover:bg-[#ff5500] hover:text-black transition-all duration-150 shadow-[0_0_10px_rgba(255,85,0,0.2)] ${className}`}
    >
      {/* Hover efektinde neon parıltı */}
      <span className="absolute inset-0 bg-[#ff5500]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></span>
      <span className="relative z-10">[{label}]</span>
    </button>
  );
}

