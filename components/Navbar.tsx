import Image from 'next/image';
import Link from 'next/link';

export const Navbar = () => (
  <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#111111] px-4 py-3">
    <div className="mx-auto flex max-w-7xl items-center justify-between">
      <Link href="/" className="flex items-center gap-2" aria-label="VIVO AMIGO inicio">
        <Image
          src="/brand-mark.svg"
          alt="VIVO AMIGO VA Shield Logo"
          width={160}
          height={50}
          priority
          className="h-10 w-auto object-contain"
        />
        <span className="hidden text-sm font-bold tracking-wide text-[#FF6A00] sm:inline">VIVO AMIGO</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-[#FF6A00]/30 bg-[#FF6A00]/20 px-3 py-1.5 text-xs font-bold text-[#FF6A00]">Guatemala City</span>
      </div>
    </div>
  </header>
);
