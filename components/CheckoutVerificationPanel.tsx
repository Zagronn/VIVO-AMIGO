'use client';

import React from 'react';
import { CardVerificationBadge } from './CardVerificationBadge';

export const CheckoutVerificationPanel = ({ dpiName, onVerify }: { dpiName: string; onVerify: () => Promise<boolean> }) => (
  <section aria-label="Verificación de pago para checkout">
    <CardVerificationBadge dpiName={dpiName} onVerify={onVerify} />
  </section>
);
