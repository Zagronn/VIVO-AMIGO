'use client';

import React from 'react';
import { CardVerificationBadge } from './CardVerificationBadge';

export const OnboardingVerificationPanel = ({ dpiName, onVerify }: { dpiName: string; onVerify: () => Promise<boolean> }) => (
  <section aria-label="Verificación de identidad y tarjeta para onboarding">
    <CardVerificationBadge dpiName={dpiName} onVerify={onVerify} />
  </section>
);
