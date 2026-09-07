'use client';

import React, { useEffect, useState } from 'react';

export const ReturnGreeting = () => {
  const [category, setCategory] = useState('Vehicles');

  useEffect(() => {
    const storedCategory = window.localStorage.getItem('last_category');
    if (storedCategory?.trim()) setCategory(storedCategory.trim());
  }, []);

  return <aside className="my-3 rounded-lg border-l-4 border-[#27AE60] bg-[#002E5D] px-4 py-3 text-white" aria-live="polite"><div className="text-[11px] font-bold tracking-[.5px] text-[#27AE60]">VERI-SHIELD · Recordatorio inteligente</div><div className="mt-1 text-[13px]">¡Bienvenido de nuevo! Puedes continuar explorando {category} y revisar opciones PAY VIVO cuando estés listo.</div></aside>;
};