'use client';

import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/session'; // Note: this is a server action, so we'll need a client-side way to fetch it or a server component wrapper.

// Since we want this to be a real-time display, let's create a server component
// and a client component for the interactive part.
// For now, let's create the client-side display that can be used inside a server component.

interface RewardBadgeProps {
  discount: number;
}

export function RewardBadge({ discount }: RewardBadgeProps) {
  if (discount === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-vivo-orange px-3 py-1 text-xs font-bold text-white shadow-sm animate-bounce">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h-1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M12 15V3" />
        <path d="M15 6h-3" />
        <path d="M9 6h3" />
      </svg>
      <span>{discount}% Discount Earned!</span>
    </div>
  );
}
