import React from 'react';

const categories = [
  { href: '/listings?category=VEHICLES_PARTS', icon: '🚗', label: 'Vehículos y Repuestos (Toyota/Hilux)', featured: true },
  { href: '/listings?category=CONSTRUCTION', icon: '🏗️', label: 'Construcción y Láminas', featured: false },
  { href: '/listings?category=TECHNOLOGY', icon: '📱', label: 'Tecnología y Celulares', featured: false },
  { href: '/listings?category=REAL_ESTATE', icon: '🏢', label: 'Inmuebles y Lanzamientos', featured: false }
];

export const CategoryBar = () => (
  <nav className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm" aria-label="Categorías del marketplace">
    <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto">
      {categories.map((category) => (
        <a
          key={category.href}
          href={category.href}
          className={category.featured
            ? 'flex shrink-0 items-center gap-2 rounded-xl border border-[#FF6A00] bg-[#FF6A00]/10 px-4 py-2 text-xs font-black text-black transition-all hover:bg-[#FF6A00] hover:text-white'
            : 'flex shrink-0 items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-slate-800 transition-all hover:bg-slate-800 hover:text-white'}
        >
          <span aria-hidden="true">{category.icon}</span>
          <span>{category.label}</span>
        </a>
      ))}
    </div>
  </nav>
);
