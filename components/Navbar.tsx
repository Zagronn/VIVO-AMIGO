import Link from 'next/link';
import { VivoBrandLogo } from './VivoBrandLogo';

export const Navbar = () => (
  <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#111111] px-4 py-3">
    <div className="mx-auto flex max-w-7xl items-center justify-between">
      <VivoBrandLogo light />
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-[#FF6A00]/30 bg-[#FF6A00]/20 px-3 py-1.5 text-xs font-bold text-[#FF6A00]">Guatemala City</span>
      </div>
    </div>
  </header>
);
